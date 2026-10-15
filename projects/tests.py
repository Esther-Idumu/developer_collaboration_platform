from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import Application, Project, ProjectRole, Role

User = get_user_model()

class ApplicationAPITests(APITestCase):

    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@test.com",
            password="password123"
        )

        self.applicant = User.objects.create_user(
            email="applicant@test.com",
            password="password123"
        )

        self.project = Project.objects.create(
            title="Test Project",
            description="A project used for testing.",
            project_owner=self.owner
        )

        self.role = Role.objects.create(
            title="Backend Developer"
        )

        self.project_role = ProjectRole.objects.create(
            project=self.project,
            role=self.role,
            no_of_developers=1
        )

    def test_user_can_submit_application(self):
        self.client.force_authenticate(user=self.applicant)

        data = {
            "project_role": self.project_role.id,
            "message": "I would like to work on this project."
        }

        response = self.client.post(
            reverse("applications"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_201_CREATED
        )

        self.assertEqual(
            Application.objects.count(),
            1
        )

        application = Application.objects.first()

        self.assertEqual(
            application.user,
            self.applicant
        )

        self.assertEqual(
            application.project_role,
            self.project_role
        )

        self.assertEqual(
            application.status,
            "pending"
        )

    def test_unauthenticated_user_cannot_submit_application(self):
        data = {
            "project_role": self.project_role.id,
            "message": "I would like to work on this project."
        }

        response = self.client.post(
            reverse("applications"),
            data,
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_401_UNAUTHORIZED
        )

        self.assertEqual(
            Application.objects.count(),
            0
        )


    def test_user_can_view_their_applications(self):
        Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse("applications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )


    def test_user_cannot_view_another_users_application_in_list(self):
        another_user = User.objects.create_user(
            email="another@test.com",
            password="password123"
        )

        Application.objects.create(
            user=another_user,
            project_role=self.project_role,
            message="Another developer application."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse("applications")
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            0
        )


    def test_user_can_view_single_application(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse(
                "application-details",
                kwargs={"id": application.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            response.data["id"],
            application.id
        )


    def test_user_cannot_view_another_users_single_application(self):
        another_user = User.objects.create_user(
            email="another@test.com",
            password="password123"
        )

        application = Application.objects.create(
            user=another_user,
            project_role=self.project_role,
            message="Another user's application."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse(
                "application-details",
                kwargs={"id": application.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_project_owner_can_view_project_applications(self):
        Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.get(
            reverse(
                "project-applications",
                kwargs={"id": self.project.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )


    def test_non_owner_cannot_view_project_applications(self):
        Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse(
                "project-applications",
                kwargs={"id": self.project.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_project_owner_can_view_project_role_applications(self):
        Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.get(
            reverse(
                "project-role-applications",
                kwargs={"id": self.project_role.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        self.assertEqual(
            len(response.data),
            1
        )


    def test_non_owner_cannot_view_project_role_applications(self):
        self.client.force_authenticate(user=self.applicant)

        response = self.client.get(
            reverse(
                "project-role-applications",
                kwargs={"id": self.project_role.id}
            )
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_applicant_can_withdraw_pending_application(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.patch(
            reverse(
                "withdraw-applications",
                kwargs={"id": application.id}
            ),
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "withdrawn"
        )


    def test_user_cannot_withdraw_another_users_application(self):
        another_user = User.objects.create_user(
            email="another@test.com",
            password="password123"
        )

        application = Application.objects.create(
            user=another_user,
            project_role=self.project_role,
            message="Another application."
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.patch(
            reverse(
                "withdraw-applications",
                kwargs={"id": application.id}
            ),
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_accepted_application_cannot_be_withdrawn(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join.",
            status="accepted"
        )

        self.client.force_authenticate(user=self.applicant)

        response = self.client.patch(
            reverse(
                "withdraw-applications",
                kwargs={"id": application.id}
            ),
            {},
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "accepted"
        )


    def test_project_owner_can_accept_application(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "application-decision",
                kwargs={"id": application.id}
            ),
            {
                "decision": "accepted"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "accepted"
        )


    def test_project_owner_can_reject_application(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "application-decision",
                kwargs={"id": application.id}
            ),
            {
                "decision": "rejected"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_200_OK
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "rejected"
        )


    def test_non_owner_cannot_make_application_decision(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        another_user = User.objects.create_user(
            email="another@test.com",
            password="password123"
        )

        self.client.force_authenticate(user=another_user)

        response = self.client.patch(
            reverse(
                "application-decision",
                kwargs={"id": application.id}
            ),
            {
                "decision": "accepted"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_404_NOT_FOUND
        )


    def test_invalid_application_decision_is_rejected(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join."
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "application-decision",
                kwargs={"id": application.id}
            ),
            {
                "decision": "maybe"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "pending"
        )


    def test_non_pending_application_cannot_be_decided_again(self):
        application = Application.objects.create(
            user=self.applicant,
            project_role=self.project_role,
            message="I would like to join.",
            status="accepted"
        )

        self.client.force_authenticate(user=self.owner)

        response = self.client.patch(
            reverse(
                "application-decision",
                kwargs={"id": application.id}
            ),
            {
                "decision": "rejected"
            },
            format="json"
        )

        self.assertEqual(
            response.status_code,
            status.HTTP_400_BAD_REQUEST
        )

        application.refresh_from_db()

        self.assertEqual(
            application.status,
            "accepted"
        )