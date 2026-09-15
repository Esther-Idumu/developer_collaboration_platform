from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes


def create_verification_token(user):
    token = default_token_generator.make_token(user)

    uid = urlsafe_base64_encode(
        force_bytes(user.pk)
    )

    verification_url = (
        f"http://localhost:5173/verify-email/{uid}/{token}/"
    )

    return verification_url


def send_verification_email(user):
    verification_url = create_verification_token(user)

    send_mail(
        subject="Verify your DevLink email",
        message=(
            f"Hi,\n\n"
            f"Thanks for joining DevLink.\n\n"
            f"Please verify your email by clicking the link below:\n\n"
            f"{verification_url}\n\n"
            f"This link expires in 24 hours.\n\n"
            f"If you didn't create a DevLink account, "
            f"you can ignore this email."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
    )