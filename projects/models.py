from django.db import models
from accounts.models import User

class Project(models.Model):
    class ProjectStatus(models.TextChoices):
        OPEN = "open"
        IN_PROGRESS = "in_progress"
        COMPLETE = "complete"

    title = models.CharField(max_length=200)
    description = models.TextField()
    project_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.OPEN)
    is_archived = models.BooleanField(default=False)
    github_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Role(models.Model):
    title = models.CharField(max_length=200, unique=True)

class Skill(models.Model):
    title = models.CharField(max_length=200, unique=True)

class ManualSkill(models.Model):
    title = models.CharField(max_length=200, blank=False)
    submitted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='manual_skills_submissions')
    created_at = models.DateTimeField(auto_now_add=True)

class ProjectRole(models.Model):
    no_of_developers = models.IntegerField(null=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='project_roles')
    skills = models.ManyToManyField(Skill)
    manual_skills = models.ManyToManyField(ManualSkill, blank=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'role'],
                name='unique_project_role'
            )
        ]

class Application(models.Model):
    class ApplicationStatus(models.TextChoices):
        PENDING = 'pending'
        ACCEPTED = 'accepted'
        REJECTED = 'rejected'
        WITHDRAWN = 'withdrawn'
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'project_role'],
                name='unique_application'
            )
        ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applications')
    project_role = models.ForeignKey(ProjectRole, on_delete=models.CASCADE, related_name='applications')
    message = models.CharField(max_length=1000)
    status = models.CharField(max_length=20, choices=ApplicationStatus.choices, default=ApplicationStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    viewed_at = models.DateTimeField(null=True, blank=True)

class ProjectMember(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='project_members')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='project_members')
    project_roles = models.ManyToManyField(ProjectRole, related_name='project_members')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'project'],
                name='unique_project_membership'
            )
        ]

class SavedProject(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="saved_projects")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="saved_by")
    saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "project"],
                name="unique_saved_project"
            )
        ]
        ordering = ["-saved_at"]


class Message(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="project_messages")
    content = models.TextField(max_length=5000)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]
