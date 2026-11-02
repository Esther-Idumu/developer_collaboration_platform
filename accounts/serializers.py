from rest_framework import serializers
from accounts.models import User, Profile
from django.contrib.auth.password_validation import validate_password as validate
from django.contrib.auth import authenticate
from accounts.utils import get_display_name

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
            'headline',
            'bio',
            'experience',
            'school',
            'graduation_year',
            'course_of_study',
            'skills',
            'manual_skills',
            'github',
            'portfolio'
        ]

    def validate_manual_skills(self, manual_skills):
        request = self.context.get('request')

        if request:
            for manual_skill in manual_skills:
                if manual_skill.submitted_by != request.user:
                    raise serializers.ValidationError(
                        "You can only use manual skills that you submitted."
                    )

        return manual_skills

class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class DeveloperSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user_id', read_only=True)
    name = serializers.SerializerMethodField()
    role = serializers.CharField(source='headline', read_only=True)
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'name', 'role', 'skills', 'github', 'portfolio']
        read_only_fields = fields

    def get_name(self, profile):
        return get_display_name(profile.user)

    def get_skills(self, profile):
        titles = [skill.title for skill in profile.skills.all()]
        titles += [skill.title for skill in profile.manual_skills.all()]
        return list(dict.fromkeys(titles))
