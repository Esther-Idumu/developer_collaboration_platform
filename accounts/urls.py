from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import RegisterView, LoginView, MeView, VerifyEmailView, ResendVerificationView, ProfileView, DeveloperListView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('token/refresh', TokenRefreshView.as_view(), name='token-refresh'),
    path('me', MeView.as_view(), name='me'),
    path('verify-email/<uidb64>/<token>', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification', ResendVerificationView.as_view(), name='resend-verification'),
    path('profile/<int:id>', ProfileView.as_view(), name='profile-detail'),
    path('profile', ProfileView.as_view(), name='profile-update'),
    path('developers', DeveloperListView.as_view(), name='developers'),
]