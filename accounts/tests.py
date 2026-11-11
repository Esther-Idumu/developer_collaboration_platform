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


from unittest import mock

from django.core import mail
from django.test import override_settings


@override_settings(FRONTEND_URL='https://devlink.example.com')
class EmailVerificationTests(APITestCase):
    def register(self, email='new@test.com'):
        return self.client.post(
            reverse('register'), {'email': email, 'password': 'a-Strong-pass-731'}, format='json'
        )

    def verification_path(self):
        body = mail.outbox[-1].body
        start = body.index('https://devlink.example.com') + len('https://devlink.example.com')
        return body[start:].split()[0]

    def test_register_sends_email_with_production_link(self):
        response = self.register()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['new@test.com'])
        self.assertIn('https://devlink.example.com/verify-email/', mail.outbox[0].body)
        self.assertNotIn('localhost', mail.outbox[0].body)

    def test_link_verifies_user_and_allows_login(self):
        self.register()
        path = self.verification_path()  # /verify-email/<uid>/<token>/
        _, uid, token = path.strip('/').split('/')

        login = {'email': 'new@test.com', 'password': 'a-Strong-pass-731'}
        self.assertEqual(self.client.post(reverse('login'), login, format='json').status_code, 400)

        response = self.client.get(reverse('verify-email', args=[uid, token]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(User.objects.get(email='new@test.com').is_email_verified)
        self.assertEqual(self.client.post(reverse('login'), login, format='json').status_code, 200)

    def test_bad_token_is_rejected(self):
        self.register()
        _, uid, _ = self.verification_path().strip('/').split('/')
        response = self.client.get(reverse('verify-email', args=[uid, 'not-a-real-token']))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.get(email='new@test.com').is_email_verified)

    def test_signup_still_succeeds_when_mail_server_fails(self):
        with mock.patch('accounts.services.email_verification.send_mail', side_effect=OSError('smtp down')):
            response = self.register('offline@test.com')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(email='offline@test.com').exists())

    def test_resend_sends_a_new_email_to_unverified_user(self):
        self.register()
        response = self.client.post(reverse('resend-verification'), {'email': 'new@test.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 2)

    def test_resend_gives_same_answer_for_unknown_and_verified_emails(self):
        User.objects.create_user(email='done@test.com', password='x', is_email_verified=True)
        known = self.client.post(reverse('resend-verification'), {'email': 'done@test.com'}, format='json')
        unknown = self.client.post(reverse('resend-verification'), {'email': 'nobody@test.com'}, format='json')
        self.assertEqual(known.status_code, unknown.status_code)
        self.assertEqual(known.data, unknown.data)
        self.assertEqual(len(mail.outbox), 0)
