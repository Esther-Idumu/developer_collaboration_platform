from django.urls import path
from .views import ProjectView, ProjectDetailView, UserProjectsView

urlpatterns = [
    path('', ProjectView.as_view(), name='projects'),
    path('user/<int:id>', UserProjectsView.as_view(), name='user-projects'),
    path('<int:id>/', ProjectDetailView.as_view(), name='project-detail'),
]