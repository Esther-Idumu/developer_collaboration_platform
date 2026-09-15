from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("Enter an email")
        normalized_email = self.normalize_email(email)
        user = self.model(email=normalized_email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        super_user = self.create_user(email, password, **extra_fields)
        super_user.is_staff = True
        super_user.is_superuser = True
        super_user.save()
        return super_user

class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True, null=False, blank=False)
    is_email_verified = models.BooleanField(default=False)
    USERNAME_FIELD = 'email'
    objects = UserManager()
    REQUIRED_FIELDS = []

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100, blank=True)
    bio = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    school = models.CharField(max_length=100, blank=True)
    graduation_year = models.IntegerField(blank=True, null=True)
    course_of_study = models.CharField(max_length=100, blank=True)
    github = models.URLField(max_length=200, blank=True)
    portfolio = models.URLField(max_length=200, blank=True)

