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
        projects = Project.objects.filter(status=Project.ProjectStatus.OPEN)
        serializer = ProjectSerializer(projects, many=True)
        return Response(serializer.data)

class ProjectDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request, id):
        project = get_object_or_404(Project, id=id)
        serializer = ProjectSerializer(project)
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

