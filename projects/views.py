from rest_framework.views import APIView
from .serializers import ProjectSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Project
from django.shortcuts import get_object_or_404


class ProjectView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        serializer = ProjectSerializer(data=request.data)

        if serializer.is_valid():
            project = serializer.save(project_owner=request.user)

            return Response(
                {
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