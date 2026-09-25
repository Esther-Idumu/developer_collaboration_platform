from rest_framework import serializers
from projects.models import Project, ProjectRole, Role

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

class ProjectRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRole
        read_only_fields = [
            'id'
        ]
        fields = [
            'id',
            'no_of_developers',
            'project',
            'role'
        ]

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        read_only_fields = [
            'id'
        ]
        fields = [
            'id',
            'title'
        ]