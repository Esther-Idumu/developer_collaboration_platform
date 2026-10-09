from django.urls import path
from .views import RegisterView, LoginView, MeView, VerifyEmailView, ResendVerificationView, ProfileView

urlpatterns = [
    path('register', RegisterView.as_view(), name='register'),
    path('login', LoginView.as_view(), name='login'),
    path('me', MeView.as_view(), name='me'),
    path('verify-email/<uidb64>/<token>', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification', ResendVerificationView.as_view(), name='resend-verification'),
    path('profile/<int:id>', ProfileView.as_view(), name='profile-detail'),
    path('profile', ProfileView.as_view(), name='profile-update')
]