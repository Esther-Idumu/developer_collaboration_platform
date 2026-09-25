from django.urls import path
from .views import ProjectView, ProjectDetailView, UserProjectsView, RoleView, ProjectRoleView

urlpatterns = [
    path('', ProjectView.as_view(), name='projects'),
    path('user/<int:id>', UserProjectsView.as_view(), name='user-projects'),
    path('roles/', RoleView.as_view(), name='roles'),
    path('project-roles/', ProjectRoleView.as_view(), name='project-roles'),
    path('<int:id>/', ProjectDetailView.as_view(), name='project-detail'),
]