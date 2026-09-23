from django.db import models
from accounts.models import User


class Project(models.Model):
    class ProjectStatus(models.TextChoices):
        OPEN = "open"
        CLOSED = "closed"
        IN_PROGRESS = "in_progress"
        COMPLETE = "complete"
        ARCHIVED = "archived"
        CANCELLED = "cancelled"

    title = models.CharField(max_length=200)
    description = models.TextField()
    project_owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="projects")
    status = models.CharField(max_length=20, choices=ProjectStatus.choices, default=ProjectStatus.OPEN)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)