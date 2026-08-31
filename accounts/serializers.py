from rest_framework import serializers
from accounts.models import User
from django.contrib.auth.password_validation import validate_password as validate

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
        return user