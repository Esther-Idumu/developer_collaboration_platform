from .models import User
from rest_framework.views import APIView
from .serializers import RegisterSerializer, LoginSerializer, ProfileSerializer, ResendVerificationSerializer
from .services.email_verification import send_verification_email
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            send_verification_email(user)

            return Response(
                {
                    "email": user.email,
                    "message": "Account created. Please verify your email."
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token

            return Response(
                {
                    'refresh': str(refresh),
                    'access': str(access)
                },
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile_serializer = ProfileSerializer(request.user.profile)

        return Response({
            "email": request.user.email,
            "profile": profile_serializer.data
        })

class VerifyEmailView(APIView):
    def get(self, request, uidb64, token):
        try:
            uid = force_str(
                urlsafe_base64_decode(uidb64)
            )
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError, OverflowError):
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_email_verified:
            return Response(
                {"message": "Email is already verified."},
                status=status.HTTP_200_OK
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )
        user.is_email_verified = True
        user.save(update_fields=["is_email_verified"])

        return Response(
            {"message": "Email verified successfully."},
            status=status.HTTP_200_OK
        )

class ResendVerificationView(APIView):
    def post(self, request):
        serializer = ResendVerificationSerializer(
            data=request.data
        )

        if not serializer.is_valid():
            return Response(
                serializer.errors,
                status=status.HTTP_400_BAD_REQUEST
            )
        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {
                    "message": (
                        "If an account exists with this email, "
                        "a verification email has been sent."
                    )
                },
                status=status.HTTP_200_OK
            )

        if user.is_email_verified:
            return Response(
                {
                    "message": "This email is already verified."
                },
                status=status.HTTP_400_BAD_REQUEST
            )
        send_verification_email(user)

        return Response(
            {
                "message": (
                    "If an account exists with this email, "
                    "a verification email has been sent."
                )
            },
            status=status.HTTP_200_OK
        )

