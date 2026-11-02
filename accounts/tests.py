from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Profile
from projects.models import Skill

User = get_user_model()


class DeveloperDiscoveryAPITests(APITestCase):
    def setUp(self):
        self.current_user = User.objects.create_user(email='current@test.com', password='password123')
        self.developer = User.objects.create_user(
            email='developer@test.com', password='password123', is_email_verified=True
        )
        self.profile = Profile.objects.create(
            user=self.developer,
            full_name='Jane Developer',
            headline='Backend Developer',
            bio='I build APIs with Python and Django.',
        )
        self.python_skill = Skill.objects.create(title='Python')
        self.profile.skills.add(self.python_skill)
        self.client.force_authenticate(user=self.current_user)

    def test_developer_list_excludes_current_user(self):
        Profile.objects.create(user=self.current_user, full_name='Current User')
        response = self.client.get(reverse('developers'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([item['id'] for item in response.data], [self.developer.id])

    def test_developer_list_only_returns_verified_users(self):
        unverified = User.objects.create_user(email='unverified@test.com', password='password123')
        Profile.objects.create(user=unverified, full_name='Unverified Developer')
        response = self.client.get(reverse('developers'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_developer_search_matches_headline_and_bio(self):
        response = self.client.get(reverse('developers'), {'search': 'Backend'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.developer.id)

    def test_developer_filter_matches_skill(self):
        response = self.client.get(reverse('developers'), {'skill': 'Python'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_developer_search_returns_empty_when_no_match(self):
        response = self.client.get(reverse('developers'), {'search': 'Mobile Developer'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])
