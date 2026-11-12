import logging
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


def create_verification_url(user):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    return f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"


def send_verification_email(user):
    """Send the verification link. Returns True if the email was handed to the mail server."""
    # In production the console backend only prints the email (and its link) into the server
    # log. Treat that as "not sent" instead of pretending it worked.
    if not settings.DEBUG and settings.MAILERS["default"]["BACKEND"].endswith("console.EmailBackend"):
        logger.error(
            "Verification email for user %s was NOT sent: EMAIL_HOST is not set, "
            "so no real email backend is configured.",
            user.pk,
        )
        return False

    verification_url = create_verification_url(user)
    hours = settings.PASSWORD_RESET_TIMEOUT // 3600

    try:
        send_mail(
            subject="Verify your DevLink email",
            message=(
                "Hi,\n\n"
                "Thanks for joining DevLink.\n\n"
                "Please verify your email by clicking the link below:\n\n"
                f"{verification_url}\n\n"
                f"This link expires in {hours} hours.\n\n"
                "If you didn't create a DevLink account, "
                "you can ignore this email."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )
    except Exception:
        # A mail server problem must never turn signup into a 500 or reveal server details.
        logger.exception("Could not send verification email to user %s", user.pk)
        return False

    return True
