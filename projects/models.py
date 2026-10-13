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
