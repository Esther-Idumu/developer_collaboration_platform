from rest_framework import serializers
from projects.models import Project

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        read_only_fields = [
            'id',
            'project_owner',
            'created_at',
            'updated_at'
        ]
        fields = [
            'id',
            'project_owner',
            'title',
            'description',
            'status',
            'created_at',
            'updated_at'
        ]