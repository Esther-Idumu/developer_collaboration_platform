from rest_framework import serializers
from accounts.models import User, Profile
from django.contrib.auth.password_validation import validate_password as validate
from django.contrib.auth import authenticate

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ['email', 'password']

    def validate_password(self, password):
        validate(password)
        return password

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Profile.objects.create(
            user=user
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        user = authenticate(
            email=email,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid email or password"
            )

        if not user.is_email_verified:
            raise serializers.ValidationError(
                "Please verify your email before logging in."
            )

        attrs['user'] = user

        return attrs

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = [
            'full_name',
            'bio',
            'experience',
            'school',
            'graduation_year',
            'course_of_study',
            'github',
            'portfolio'
        ]

class ResendVerificationSerializer(serializers.Serializer):

    email = serializers.EmailField()

