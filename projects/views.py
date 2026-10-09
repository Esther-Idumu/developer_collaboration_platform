from rest_framework.views import APIView
from .serializers import ProjectSerializer, RoleSerializer, ProjectRoleSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Project, Role, ProjectRole
from django.shortcuts import get_object_or_404
from .models import Project, ProjectRole

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
        project = Project.objects.filter(project_owner_id=id)
        serializer = ProjectSerializer(project, many=True)
        return Response(serializer.data)

class RoleView(APIView):
    permission_classes = [IsAuthenticated]

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
        serializer = ProjectRoleSerializer(data=request.data)
        if serializer.is_valid():
            project = get_object_or_404(
                Project,
                id=request.data["project"]
            )

            if project.project_owner != request.user:
                return Response(
                    {"detail": "You do not have permission to modify this project."},
                    status=status.HTTP_403_FORBIDDEN
                )
            
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

