from django.urls import path
from .views import ProjectView, ProjectDetailView, UserProjectsView, RoleView, ProjectRoleView, ProjectStatusView, ArchivedProjectsView, SkillView, ManualSkillView, ApplicationView, ApplicationDetailView, ProjectApplicationsView, ProjectRoleApplicationsView, WithdrawApplicationView, ApplicationDecisionView, ProjectMemberView, ProjectMembersView

urlpatterns = [
    path('', ProjectView.as_view(), name='projects'),
    path('user/<int:id>', UserProjectsView.as_view(), name='user-projects'),
    path('roles', RoleView.as_view(), name='roles'),
    path('project-roles', ProjectRoleView.as_view(), name='project-roles'),
    path('archived', ArchivedProjectsView.as_view(), name='archived-projects'),
    path('skills', SkillView.as_view(), name='skills'),
    path('manual-skills', ManualSkillView.as_view(), name='manual-skills'),
    path('applications', ApplicationView.as_view(), name='applications'),
    path('applications/<int:id>', ApplicationDetailView.as_view(), name='application-details'),
    path('applications/<int:id>/withdraw', WithdrawApplicationView.as_view(), name='withdraw-applications'),
    path('applications/<int:id>/decision', ApplicationDecisionView.as_view(), name='application-decision'),
    path('project-roles/<int:id>/applications', ProjectRoleApplicationsView.as_view(), name='project-role-applications'),
    path('<int:id>', ProjectDetailView.as_view(), name='project-details'),
    path('project-member/<int:id>', ProjectMemberView.as_view(), name='project-member'),
    path('<int:id>/status', ProjectStatusView.as_view(), name='project-status'),
    path('<int:id>/applications', ProjectApplicationsView.as_view(), name='project-applications'),
    path('<int:id>/project-members', ProjectMembersView.as_view(), name='project-members'),
]