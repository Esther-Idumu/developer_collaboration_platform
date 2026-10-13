from django.urls import path
from .views import ProjectView, ProjectDetailView, UserProjectsView, RoleView, ProjectRoleView, ProjectStatusView, ArchivedProjectsView, SkillView, ManualSkillView

urlpatterns = [
    path('', ProjectView.as_view(), name='projects'),
    path('user/<int:id>', UserProjectsView.as_view(), name='user-projects'),
    path('roles', RoleView.as_view(), name='roles'),
    path('project-roles', ProjectRoleView.as_view(), name='project-roles'),
    path('archived', ArchivedProjectsView.as_view(), name='archived-projects'),
    path('skills', SkillView.as_view(), name='skills'),
    path('manual-skills', ManualSkillView.as_view(), name='manual-skills'),
    path('<int:id>', ProjectDetailView.as_view(), name='project-detail'),
    path('<int:id>/status', ProjectStatusView.as_view(), name='project-status'),
]