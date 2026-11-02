from rest_framework import serializers
from projects.models import Project, ProjectRole, Role, Skill, ManualSkill, Application, ProjectMember, SavedProject, Message
from accounts.utils import get_display_name

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

class ProjectSummarySerializer(ProjectSerializer):
    skills = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    capacity = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    new_applications = serializers.SerializerMethodField()

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            'skills',
            'members',
            'capacity',
            'role',
            'new_applications'
        ]

    def get_skills(self, project):
        titles = []
        for project_role in project.project_roles.all():
            titles += [skill.title for skill in project_role.skills.all()]
            titles += [skill.title for skill in project_role.manual_skills.all()]
        return list(dict.fromkeys(titles))

    def get_members(self, project):
        return [
            {'id': member.user_id, 'name': get_display_name(member.user)}
            for member in project.project_members.all()
        ]

    def get_capacity(self, project):
        return sum(project_role.no_of_developers for project_role in project.project_roles.all())

    def get_role(self, project):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return None
        if project.project_owner_id == request.user.id:
            return 'owner'
        if any(member.user_id == request.user.id for member in project.project_members.all()):
            return 'member'
        return None

    def get_new_applications(self, project):
        """Pending applications waiting on the owner. Always 0 for everyone else."""
        request = self.context.get('request')
        if request is None or project.project_owner_id != request.user.id:
            return 0
        return sum(
            1
            for project_role in project.project_roles.all()
            for application in project_role.applications.all()
            if application.status == Application.ApplicationStatus.PENDING
        )

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


class SavedProjectSerializer(serializers.ModelSerializer):
    project = ProjectSummarySerializer(read_only=True)

    class Meta:
        model = SavedProject
        fields = ['id', 'project', 'saved_at']
        read_only_fields = fields


class MessageSerializer(serializers.ModelSerializer):
    sender = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'project', 'sender', 'content', 'created_at']
        read_only_fields = ['id', 'project', 'sender', 'created_at']

    def get_sender(self, message):
        return {
            'id': message.sender_id,
            'name': get_display_name(message.sender),
        }
