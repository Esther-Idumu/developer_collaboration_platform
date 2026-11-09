from rest_framework.views import APIView
from .serializers import ProjectSerializer, ProjectSummarySerializer, RoleSerializer, ProjectRoleSerializer, SkillSerializer, ManualSkillSerializer, ApplicationSerializer, ProjectMemberSerializer, SavedProjectSerializer, MessageSerializer, ApplicationDetailSerializer, ProjectDetailSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Project, Role, ProjectRole, Skill, ManualSkill, Application, ProjectMember, SavedProject, Message, ChatReadState
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils import timezone
from django.db.models import Q
from accounts.models import User
from accounts.utils import get_display_name, get_avatar_url

def with_summary_data(queryset):
    """Prefetch everything ProjectSummarySerializer reads, newest projects first."""
    return queryset.prefetch_related(
        'project_roles__skills',
        'project_roles__manual_skills',
        'project_roles__applications',
        'project_members__user__profile',
    ).order_by('-created_at')


def with_detail_data(queryset):
    """Select/prefetch everything ProjectDetailSerializer reads."""
    return queryset.select_related('project_owner__profile').prefetch_related(
        'project_roles__role',
        'project_roles__skills',
        'project_roles__manual_skills',
        'project_roles__project_members',
        'project_roles__applications',
        'project_members__user__profile',
        'project_members__project_roles__role',
    )


class ProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ProjectSerializer(data=request.data)
        if serializer.is_valid():
            project = serializer.save(project_owner=request.user)
            return Response({
                    "message": "Project created successfully.",
                    "project": ProjectSerializer(project).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):
        projects = with_summary_data(
            Project.objects.filter(status=Project.ProjectStatus.OPEN, is_archived=False)
        )
        serializer = ProjectSummarySerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)


class MyProjectsView(APIView):
    """Projects the current user owns or is a member of."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = with_summary_data(
            Project.objects.filter(
                Q(project_owner=request.user) | Q(project_members__user=request.user),
                is_archived=False
            ).distinct()
        )
        serializer = ProjectSummarySerializer(projects, many=True, context={'request': request})
        return Response(serializer.data)

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        # Archived projects are only visible to their owner.
        projects = with_detail_data(
            Project.objects.filter(Q(is_archived=False) | Q(project_owner=request.user))
        )
        project = get_object_or_404(projects, id=id)
        serializer = ProjectDetailSerializer(project, context={'request': request})
        return Response(serializer.data)

    def patch(self, request, id):
        project = get_object_or_404(Project, id=id)

        if project.project_owner != request.user:
            return Response({
                "error": "You do not have permission to update this project."
            },
            status=status.HTTP_403_FORBIDDEN)
        
        serializer = ProjectSerializer(project, data=request.data, partial=True)
        if serializer.is_valid():
            project = serializer.save()
            return Response({
                "message": "Project updated successfully.",
                "project": ProjectSerializer(project).data
            },
            status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, id):
        project = get_object_or_404(Project, id=id)

        if project.project_owner!=request.user:
            return Response({
                "message": "You are not allowed to delete this project."
            },
            status=status.HTTP_403_FORBIDDEN)

        project.delete()
        return Response({
            "message": "Project deleted successfully."
        },
        status=status.HTTP_204_NO_CONTENT)

class ProjectStatusView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        project = get_object_or_404(Project, id=id)

        if project.project_owner != request.user:
            return Response(
                {"error": "You do not have permission to change this project's status."},
                status=status.HTTP_403_FORBIDDEN
            )
        new_status = request.data.get("status")
        if not new_status:
            return Response(
                {"error": "Status is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        allowed_transitions = {
            "open": ["in_progress"],
            "in_progress": ["complete"],
            "complete": []
        }
        if new_status not in allowed_transitions:
            return Response(
                {"error": "Invalid project status."},
                status=status.HTTP_400_BAD_REQUEST
            )
        if new_status not in allowed_transitions[project.status]:
            return Response({
                "error": f"You cannot change status from {project.status} to {new_status}."
            },
            status=status.HTTP_400_BAD_REQUEST
            )
        project.status = new_status
        project.save(update_fields=["status"])

        return Response(
            {
                "message": "Project status updated successfully.",
                "status": project.status
            },
            status=status.HTTP_200_OK
        )

class ArchivedProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = Project.objects.filter(project_owner=request.user, is_archived=True)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)
    
class UserProjectsView(APIView):
    permission_classes = [IsAuthenticated]
    """Projects a given user owns or is a member of (for their profile page)."""

    def get(self, request, id):
        user = get_object_or_404(User, id=id)
        projects = with_summary_data(
            Project.objects.filter(
                Q(project_owner=user) | Q(project_members__user=user),
                is_archived=False
            ).distinct()
        )
        serializer = ProjectSummarySerializer(
            projects, many=True, context={'request': request, 'role_for': user}
        )
        return Response(serializer.data)

class RoleView(APIView):
    def get_permissions(self):
        if self.request.method == "POST":
            self.permission_classes = [IsAdminUser]
        else:
            self.permission_classes = [IsAuthenticated]
        return [permission() for permission in self.permission_classes]

    def post(self, request):
        serializer = RoleSerializer(data=request.data)
        if serializer.is_valid():
            role = serializer.save()
            return Response({
                    "message": "Role created successfully.",
                    "role": RoleSerializer(role).data
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
            )

    def get(self, request):
        roles = Role.objects.all()
        serializer = RoleSerializer(roles, many=True)
        return Response(serializer.data)

class ProjectRoleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
            project = get_object_or_404(Project, id=request.data.get('project'))

            if project.project_owner != request.user:
                return Response(
                    {"message": "You do not have permission to modify this project."},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer = ProjectRoleSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                projectrole = serializer.save()
                return Response({
                    "message": "Project's role created successfully.",
                    "projectrole": ProjectRoleSerializer(projectrole).data
                },
                status=status.HTTP_201_CREATED
                )
            
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )

    def get(self, request):
        project_roles = ProjectRole.objects.all()
        serializer = ProjectRoleSerializer(project_roles, many=True)
        return Response(serializer.data)

class SkillView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        skills = Skill.objects.all()
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

class ManualSkillView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ManualSkillSerializer(data=request.data)
        if serializer.is_valid():
            manual_skill = serializer.save(submitted_by=request.user)
            return Response ({
                "message": "Manual skill created successfully.",
                "manual_skill": ManualSkillSerializer(manual_skill).data
            },
            status=status.HTTP_201_CREATED
            )
        return Response (
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def get(self, request):
        manual_skills = ManualSkill.objects.filter(submitted_by=request.user)
        serializer = ManualSkillSerializer(manual_skills, many=True)
        return Response(serializer.data)

class ApplicationView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ApplicationSerializer(data=request.data)
        if serializer.is_valid():
            project_role = serializer.validated_data['project_role']
            project = project_role.project
            if project.status == 'open':
                if project.project_owner == request.user:
                    return Response({
                        "message": "You cannot apply to a project you own."
                    }, status=status.HTTP_400_BAD_REQUEST)
                serializer.save(user=request.user)
                return Response({
                    "message": "Application created successfully.",
                    "application": serializer.data
                },
                status=status.HTTP_201_CREATED)
            return Response({
                "message": "Applications are closed for this project.",
            }, status=status.HTTP_400_BAD_REQUEST)
        return Response(
                        serializer.errors,
                        status=status.HTTP_400_BAD_REQUEST
                    )

    def get(self, request):
        applications = Application.objects.filter(user=request.user)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

def with_application_data(queryset):
    return queryset.select_related(
        'user__profile',
        'project_role__role',
        'project_role__project__project_owner__profile',
    ).prefetch_related(
        'user__profile__skills',
        'user__profile__manual_skills',
    ).order_by('-created_at')


class ReceivedApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = with_application_data(
            Application.objects.filter(project_role__project__project_owner=request.user)
        )
        serializer = ApplicationDetailSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class SentApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = with_application_data(Application.objects.filter(user=request.user))
        serializer = ApplicationDetailSerializer(applications, many=True, context={'request': request})
        return Response(serializer.data)


class ApplicationViewedView(APIView):
    """The project owner opened an application: record it the first time."""
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        application = get_object_or_404(
            with_application_data(
                Application.objects.filter(project_role__project__project_owner=request.user)
            ),
            id=id,
        )
        if application.viewed_at is None:
            application.viewed_at = timezone.now()
            # update_fields keeps updated_at (the decision time) untouched
            application.save(update_fields=['viewed_at'])
        serializer = ApplicationDetailSerializer(application, context={'request': request})
        return Response(serializer.data)


class ApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        application = get_object_or_404(Application, id=id, user=request.user)
        serializer = ApplicationSerializer(application)
        return Response(serializer.data)

class ProjectApplicationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        project = get_object_or_404(Project, id=id, project_owner=request.user)
        applications = Application.objects.filter(
            project_role__project=project)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class ProjectRoleApplicationsView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        project_role = get_object_or_404(ProjectRole, id=id, project__project_owner=request.user)
        applications = Application.objects.filter(project_role=project_role)
        serializer = ApplicationSerializer(applications, many=True)
        return Response(serializer.data)

class WithdrawApplicationView(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, id):
        application = get_object_or_404(Application, id=id, user=request.user)
        if application.status=='pending':
            application.status='withdrawn'
            application.save()
            serializer = ApplicationSerializer(application)
            return Response({
                "message": "Application withdrawn successfully.",
                "application": serializer.data
            },
            status=status.HTTP_200_OK)
        return Response({
            "message": "Only pending applications can be withdrawn."
        },status=status.HTTP_400_BAD_REQUEST)

class ApplicationDecisionView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        decision = request.data.get('decision')
        if decision not in ['accepted', 'rejected']:
            return Response({
                "message": "This is not a valid option."
            }, status=status.HTTP_400_BAD_REQUEST)

        with transaction.atomic():
            application = get_object_or_404(Application.objects.select_for_update(),
                                            id=id, 
                                            project_role__project__project_owner=request.user)
        
            if application.status !='pending':
                return Response({
                    "message": "Only pending applications can be accepted or rejected."
                }, status=status.HTTP_400_BAD_REQUEST)
            if decision == 'accepted':
                project_role = ProjectRole.objects.select_for_update().get(id=application.project_role.id)
                current_members = project_role.project_members.count()
                if current_members >= project_role.no_of_developers:
                    return Response({
                        "message": "This role has reached its maximum capacity."
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                project_member, _ = ProjectMember.objects.get_or_create(
                    user=application.user,
                    project=project_role.project
                )
                project_member.project_roles.add(project_role)
                    
            application.status = decision
            application.save()
        serializer = ApplicationSerializer(application)
        return Response({
            "message": f"Application has been {decision} successfully.",
            "application": serializer.data
        },status=status.HTTP_200_OK)

class ProjectMembersView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        project = get_object_or_404(Project, id=id)
        project_members = project.project_members.all()
        serializer = ProjectMemberSerializer(project_members, many=True)
        return Response(serializer.data)

class ProjectMemberView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        project_member = get_object_or_404(ProjectMember, id=id)
        serializer = ProjectMemberSerializer(project_member)
        return Response (serializer.data)

class SavedProjectsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        saved_projects = (
            SavedProject.objects
            .filter(user=request.user, project__is_archived=False)
            .select_related('project', 'project__project_owner')
            .prefetch_related('project__project_roles__skills', 'project__project_roles__manual_skills', 'project__project_members__user__profile')
        )
        serializer = SavedProjectSerializer(saved_projects, many=True, context={'request': request})
        return Response(serializer.data)


class SaveProjectView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        project = get_object_or_404(
            Project,
            id=id,
            status=Project.ProjectStatus.OPEN,
            is_archived=False,
        )
        if project.project_owner_id == request.user.id:
            return Response({'message': 'You cannot save your own project.'}, status=status.HTTP_400_BAD_REQUEST)

        saved_project, created = SavedProject.objects.get_or_create(user=request.user, project=project)
        return Response(
            {'message': 'Project saved.' if created else 'Project is already saved.', 'is_saved': True},
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request, id):
        saved_project = SavedProject.objects.filter(user=request.user, project_id=id)
        if not saved_project.exists():
            return Response({'message': 'Project is not in your saved projects.'}, status=status.HTTP_404_NOT_FOUND)
        saved_project.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


MESSAGE_PAGE_SIZE = 200


def chat_projects_for(user):
    return (
        Project.objects
        .filter(Q(project_owner=user) | Q(project_members__user=user), is_archived=False)
        .distinct()
    )


def can_access_chat(user, project):
    return project.project_owner_id == user.id or ProjectMember.objects.filter(project=project, user=user).exists()


def build_chat_summaries(user, request):
    projects = list(chat_projects_for(user).prefetch_related('project_members'))
    read_at = {state.project_id: state.last_read_at for state in ChatReadState.objects.filter(user=user)}
    joined_at = {member.project_id: member.joined_at for member in ProjectMember.objects.filter(user=user)}

    chats = []
    for project in projects:
        # Messages from before the user joined (or created the project) never count as unread.
        since = read_at.get(project.id) or joined_at.get(project.id) or project.created_at
        unread = project.messages.filter(created_at__gt=since).exclude(sender=user).count()
        last = project.messages.select_related('sender__profile').order_by('-created_at').first()

        chats.append({
            'project_id': project.id,
            'title': project.title,
            'member_count': len(project.project_members.all()) + 1,  # + the owner, who is not a ProjectMember row
            'last_message': MessageSerializer(last, context={'request': request}).data if last else None,
            'unread_count': unread,
            'last_activity': last.created_at if last else project.created_at,
        })

    chats.sort(key=lambda chat: chat['last_activity'], reverse=True)
    return chats


class ChatListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(build_chat_summaries(request.user, request))


class ChatUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        chats = build_chat_summaries(request.user, request)
        return Response({'count': sum(chat['unread_count'] for chat in chats)})


class ProjectChatView(APIView):
    """Header and member panel for one chat: title plus everyone in it (owner first)."""
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        project = get_object_or_404(Project.objects.select_related('project_owner__profile'), id=id)
        if not can_access_chat(request.user, project):
            return Response({'message': 'You do not have access to this project chat.'}, status=status.HTTP_403_FORBIDDEN)

        def person(user, role, joined_at):
            return {
                'id': user.id,
                'name': get_display_name(user),
                'avatar_url': get_avatar_url(getattr(user, 'profile', None), request),
                'role': role,
                'joined_at': joined_at,
            }

        members = [person(project.project_owner, 'owner', project.created_at)]
        for member in project.project_members.select_related('user__profile').order_by('joined_at'):
            members.append(person(member.user, 'member', member.joined_at))

        return Response({'id': project.id, 'title': project.title, 'members': members})


class ProjectMessagesView(APIView):
    permission_classes = [IsAuthenticated]

    def get_project_for_member(self, request, id):
        project = get_object_or_404(Project, id=id)
        if not can_access_chat(request.user, project):
            return None
        return project

    def get(self, request, id):
        project = self.get_project_for_member(request, id)
        if project is None:
            return Response({'message': 'You do not have access to this project chat.'}, status=status.HTTP_403_FORBIDDEN)

        messages = project.messages.select_related('sender__profile')

        # ?after=<message id> lets the chat poll for only what is new.
        after = request.query_params.get('after')
        if after is not None:
            if not after.isdigit():
                return Response({'message': 'after must be a message id.'}, status=status.HTTP_400_BAD_REQUEST)
            messages = messages.filter(id__gt=int(after))
            batch = list(messages.order_by('id'))
        else:
            batch = list(messages.order_by('-id')[:MESSAGE_PAGE_SIZE])[::-1]

        return Response(MessageSerializer(batch, many=True, context={'request': request}).data)

    def post(self, request, id):
        project = self.get_project_for_member(request, id)
        if project is None:
            return Response({'message': 'You do not have access to this project chat.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = MessageSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            message = serializer.save(project=project, sender=request.user)
            return Response(MessageSerializer(message, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ProjectMessagesReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, id):
        project = get_object_or_404(Project, id=id)
        if not can_access_chat(request.user, project):
            return Response({'message': 'You do not have access to this project chat.'}, status=status.HTTP_403_FORBIDDEN)
        ChatReadState.objects.update_or_create(
            project=project,
            user=request.user,
            defaults={'last_read_at': timezone.now()},
        )
        return Response(status=status.HTTP_204_NO_CONTENT)
