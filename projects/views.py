from rest_framework.views import APIView
from .serializers import ProjectSerializer, RoleSerializer, ProjectRoleSerializer, SkillSerializer, ManualSkillSerializer, ApplicationSerializer, ProjectMemberSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from .models import Project, Role, ProjectRole, Skill, ManualSkill, Application, ProjectMember
from django.shortcuts import get_object_or_404
from django.db import transaction

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
        projects = Project.objects.filter(status=Project.ProjectStatus.OPEN, is_archived=False)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id):
        project = get_object_or_404(Project, id=id)
        serializer = ProjectSerializer(project)
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
    def get(self, request, id):
        project = Project.objects.filter(project_owner_id=id, is_archived=False)
        serializer = ProjectSerializer(project, many=True)
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