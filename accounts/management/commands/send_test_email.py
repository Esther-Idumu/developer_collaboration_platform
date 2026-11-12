from django.conf import settings
from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        "Send a test email with the current email settings. "
        "Unlike signup, it shows the real error when sending fails."
    )

    def add_arguments(self, parser):
        parser.add_argument("recipient", help="Email address to send the test to")

    def handle(self, *args, **options):
        recipient = options["recipient"]
        mailer = settings.MAILERS["default"]
        smtp = mailer.get("OPTIONS", {})

        self.stdout.write(f"Backend:      {mailer['BACKEND']}")

        if smtp:
            security = "SSL" if smtp.get("use_ssl") else "STARTTLS" if smtp.get("use_tls") else "none"
            self.stdout.write(f"SMTP server:  {smtp.get('host')}:{smtp.get('port')} ({security})")
            self.stdout.write(f"SMTP user:    {smtp.get('username') or '(none)'}")
            self.stdout.write(f"Password set: {'yes' if smtp.get('password') else 'NO'}")

        self.stdout.write(f"From:         {settings.DEFAULT_FROM_EMAIL}")
        self.stdout.write(f"Frontend URL: {settings.FRONTEND_URL}")
        self.stdout.write("")

        if not smtp:
            self.stdout.write(self.style.WARNING(
                "EMAIL_HOST is not set, so this only prints the email below instead of sending it.\n"
            ))

        try:
            send_mail(
                subject="DevLink test email",
                message="If you can read this, DevLink can send email.",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
            )
        except Exception as error:
            raise CommandError(f"Sending failed: {type(error).__name__}: {error}")

        if smtp:
            self.stdout.write(self.style.SUCCESS(
                f"Sent to {recipient}. Check the inbox and the spam folder."
            ))
