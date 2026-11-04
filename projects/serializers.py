from rest_framework import serializers
from projects.models import Project, ProjectRole, Role, Skill, ManualSkill, Application, ProjectMember, SavedProject, Message
from accounts.utils import get_display_name, get_avatar_url

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
            'github_url',
            'website_url',
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
        request = self.context.get('request')
        return [
            {
                'id': member.user_id,
                'name': get_display_name(member.user),
                'avatar_url': get_avatar_url(getattr(member.user, 'profile', None), request),
            }
            for member in project.project_members.all()
        ]

    def get_capacity(self, project):
        return sum(project_role.no_of_developers for project_role in project.project_roles.all())

    def get_role(self, project):
        """Role of `role_for` in the context (defaults to the requesting user)."""
        request = self.context.get('request')
        subject = self.context.get('role_for')
        if subject is None and request is not None and request.user.is_authenticated:
            subject = request.user
        if subject is None:
            return None
        if project.project_owner_id == subject.id:
            return 'owner'
        if any(member.user_id == subject.id for member in project.project_members.all()):
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

class ProjectDetailSerializer(ProjectSummarySerializer):
    """Everything the project page shows: owner, team, roles (with the viewer's application) and saved state."""
    owner = serializers.SerializerMethodField()
    team = serializers.SerializerMethodField()
    roles = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta(ProjectSummarySerializer.Meta):
        fields = ProjectSummarySerializer.Meta.fields + ['owner', 'team', 'roles', 'is_saved']

    def _person(self, user):
        profile = getattr(user, 'profile', None)
        return {
            'id': user.id,
            'name': get_display_name(user),
            'avatar_url': get_avatar_url(profile, self.context.get('request')),
            'headline': profile.headline if profile else '',
        }

    def get_owner(self, project):
        return self._person(project.project_owner)

    def get_team(self, project):
        team = []
        for member in sorted(project.project_members.all(), key=lambda member: member.joined_at):
            person = self._person(member.user)
            person['roles'] = [project_role.role.title for project_role in member.project_roles.all()]
            team.append(person)
        return team

    def get_roles(self, project):
        request = self.context.get('request')
        applications = {}
        if request is not None and request.user.is_authenticated:
            applications = {
                application.project_role_id: application
                for application in Application.objects.filter(user=request.user, project_role__project=project)
            }

        roles = []
        for project_role in project.project_roles.all():
            application = applications.get(project_role.id)
            skills = [skill.title for skill in project_role.skills.all()]
            skills += [skill.title for skill in project_role.manual_skills.all()]
            roles.append({
                'id': project_role.id,
                'title': project_role.role.title,
                'skills': skills,
                'no_of_developers': project_role.no_of_developers,
                'filled': len(project_role.project_members.all()),
                'my_application': {'id': application.id, 'status': application.status} if application else None,
            })
        return roles

    def get_is_saved(self, project):
        request = self.context.get('request')
        if request is None or not request.user.is_authenticated:
            return False
        return SavedProject.objects.filter(user=request.user, project=project).exists()

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

class ApplicationDetailSerializer(serializers.ModelSerializer):
    """An application with the applicant, the owner, the role and the project already filled in."""
    role = serializers.CharField(source='project_role.role.title', read_only=True)
    project = serializers.SerializerMethodField()
    applicant = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            'id',
            'status',
            'message',
            'created_at',
            'updated_at',
            'viewed_at',
            'role',
            'project',
            'applicant',
            'owner',
        ]
        read_only_fields = fields

    def _person(self, user):
        profile = getattr(user, 'profile', None)
        return {
            'id': user.id,
            'name': get_display_name(user),
            'avatar_url': get_avatar_url(profile, self.context.get('request')),
        }

    def get_project(self, application):
        project = application.project_role.project
        return {'id': project.id, 'title': project.title, 'status': project.status}

    def get_owner(self, application):
        return self._person(application.project_role.project.project_owner)

    def get_applicant(self, application):
        user = application.user
        profile = getattr(user, 'profile', None)
        person = self._person(user)

        skills = []
        if profile:
            skills = [skill.title for skill in profile.skills.all()]
            skills += [skill.title for skill in profile.manual_skills.all()]

        person.update({
            'headline': profile.headline if profile else '',
            'github': profile.github if profile else '',
            'portfolio': profile.portfolio if profile else '',
            'skills': skills,
        })
        return person


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
