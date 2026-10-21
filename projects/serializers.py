from rest_framework import serializers
from projects.models import Project, ProjectRole, Role, Skill, ManualSkill, Application, ProjectMember

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        read_only_fields = [
            'id',
            'project_owner',
            'status',
            'created_at',
            'updated_at'
        ]
        fields = [
            'id',
            'project_owner',
            'title',
            'description',
            'status',
            'is_archived',
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
            'role',
            'skills',
            'manual_skills'
        ]

    def validate_manual_skills(self, manual_skills):
        request = self.context.get('request')

        if request:
            for manual_skill in manual_skills:
                if manual_skill.submitted_by != request.user:
                    raise serializers.ValidationError(
                        "You can only use manual skills that you submitted."
                    )

        return manual_skills

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

class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        read_only_fields = [
            'id'
        ]
        fields = [
            'id',
            'title'
        ]

class ManualSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = ManualSkill
        read_only_fields = [
            'id',
            'submitted_by',
            'created_at'
        ]
        fields = [
            'id',
            'title',
            'submitted_by',
            'created_at'
        ]

class ApplicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Application
        read_only_fields = [
            'id',
            'user',
            'status',
            'created_at',
            'updated_at'
        ]
        fields = [
            'id',
            'user',
            'project_role',
            'message',
            'status',
            'created_at',
            'updated_at'
        ]

class ProjectMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectMember
        fields = [
            'id',
            'project',
            'user',
            'project_roles',
            'joined_at'
        ]
        read_only_fields = fields
