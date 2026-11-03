from rest_framework import serializers
from accounts.models import User, Profile
from django.contrib.auth.password_validation import validate_password as validate
from django.contrib.auth import authenticate
from accounts.utils import get_display_name, get_avatar_url
from django.db import transaction
from projects.models import Skill, ManualSkill
import uuid

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

MAX_AVATAR_BYTES = 2 * 1024 * 1024
MAX_SKILLS = 30
MAX_BIO_LENGTH = 280


class SkillTitlesField(serializers.ListField):
    """
    Readable skill names (standard + manual) when reading.
    On write, a list of names that REPLACES the profile's skills (see ProfileSerializer.update).
    """
    child = serializers.CharField(max_length=50)

    def get_attribute(self, profile):
        titles = [skill.title for skill in profile.skills.all()]
        titles += [skill.title for skill in profile.manual_skills.all()]
        return list(dict.fromkeys(titles))


class ProfileSerializer(serializers.ModelSerializer):
    # Read-only extras so a profile page needs no second lookup.
    id = serializers.IntegerField(source='user_id', read_only=True)
    name = serializers.SerializerMethodField()
    joined_at = serializers.DateTimeField(source='user.date_joined', read_only=True)
    avatar_url = serializers.SerializerMethodField()

    # Write-only: the uploaded photo. Read it back through `avatar_url`.
    avatar = serializers.FileField(write_only=True, required=False)

    # `skills` / `manual_skills` stay as ids; `skill_titles` is the by-name version.
    skill_titles = SkillTitlesField(required=False, max_length=MAX_SKILLS)

    class Meta:
        model = Profile
        fields = [
            'id',
            'name',
            'joined_at',
            'full_name',
            'headline',
            'open_to_collaborate',
            'avatar',
            'avatar_url',
            'bio',
            'experience',
            'school',
            'graduation_year',
            'course_of_study',
            'skills',
            'manual_skills',
            'skill_titles',
            'github',
            'portfolio'
        ]
        extra_kwargs = {'bio': {'max_length': MAX_BIO_LENGTH}}

    def get_name(self, profile):
        return get_display_name(profile.user)

    def get_avatar_url(self, profile):
        return get_avatar_url(profile, self.context.get('request'))

    def validate_avatar(self, file):
        if file.size > MAX_AVATAR_BYTES:
            raise serializers.ValidationError("Photo must be 2 MB or smaller.")

        header = file.read(8)
        file.seek(0)

        # Check the real file contents, not just the name the browser sent.
        if header.startswith(b'\x89PNG\r\n\x1a\n'):
            extension = 'png'
        elif header.startswith(b'\xff\xd8\xff'):
            extension = 'jpg'
        else:
            raise serializers.ValidationError("Photo must be a JPG or PNG image.")

        file.name = f"{uuid.uuid4().hex}.{extension}"
        return file

    def validate_manual_skills(self, manual_skills):
        request = self.context.get('request')

        if request:
            for manual_skill in manual_skills:
                if manual_skill.submitted_by != request.user:
                    raise serializers.ValidationError(
                        "You can only use manual skills that you submitted."
                    )

        return manual_skills

    def update(self, profile, validated_data):
        titles = validated_data.pop('skill_titles', None)
        old_avatar = profile.avatar.name if 'avatar' in validated_data and profile.avatar else None

        with transaction.atomic():
            profile = super().update(profile, validated_data)

            if titles is not None:
                self._replace_skills(profile, titles)

        if old_avatar:
            profile.avatar.storage.delete(old_avatar)

        return profile

    def _replace_skills(self, profile, titles):
        skills, manual_skills, seen = [], [], set()

        for title in titles:
            title = title.strip()
            key = title.lower()

            if not title or key in seen:
                continue
            seen.add(key)

            skill = Skill.objects.filter(title__iexact=title).first()
            if skill:
                skills.append(skill)
                continue

            manual_skill = ManualSkill.objects.filter(
                submitted_by=profile.user, title__iexact=title
            ).first() or ManualSkill.objects.create(submitted_by=profile.user, title=title)
            manual_skills.append(manual_skill)

        profile.skills.set(skills)
        profile.manual_skills.set(manual_skills)


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField()


class DeveloperSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source='user_id', read_only=True)
    name = serializers.SerializerMethodField()
    role = serializers.CharField(source='headline', read_only=True)
    skills = serializers.SerializerMethodField()
    bio = serializers.CharField(read_only=True)
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'name', 'role', 'bio', 'avatar_url', 'skills', 'github', 'portfolio']
        read_only_fields = fields

    def get_name(self, profile):
        return get_display_name(profile.user)

    def get_avatar_url(self, profile):
        return get_avatar_url(profile, self.context.get('request'))

    def get_skills(self, profile):
        titles = [skill.title for skill in profile.skills.all()]
        titles += [skill.title for skill in profile.manual_skills.all()]
        return list(dict.fromkeys(titles))
