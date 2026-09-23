from rest_framework.views import APIView
from .serializers import ProjectSerializer
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated


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