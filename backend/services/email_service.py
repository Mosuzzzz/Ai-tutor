from email.message import EmailMessage
from urllib.parse import urlencode
import smtplib
import ssl

from config import settings


def is_email_delivery_configured() -> bool:
    return bool(settings.SMTP_HOST)


def build_app_link(path: str, *, token: str, email: str | None = None, action: str | None = None) -> str:
    base_url = settings.FRONTEND_URL.rstrip("/")
    params = {"token": token}
    if email:
        params["email"] = email
    if action:
        params["action"] = action
    return f"{base_url}{path}?{urlencode(params)}"


def _send_email(subject: str, text_body: str, html_body: str, to_email: str) -> None:
    if not is_email_delivery_configured():
        return

    message = EmailMessage()
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    if settings.SMTP_USE_SSL:
        smtp_client = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)
    else:
        smtp_client = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15)

    with smtp_client as smtp:
        smtp.ehlo()
        if settings.SMTP_USE_TLS and not settings.SMTP_USE_SSL:
            smtp.starttls(context=ssl.create_default_context())
            smtp.ehlo()
        if settings.SMTP_USERNAME:
            smtp.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        smtp.send_message(message)


def send_verification_email(recipient_email: str, token: str) -> None:
    link = build_app_link("/login", token=token, email=recipient_email, action="verify-email")
    subject = "Verify your Ai Tutor email"
    text_body = (
        "Welcome to Ai Tutor!\n\n"
        f"Verify your email by opening this link:\n{link}\n\n"
        "If you did not create this account, you can ignore this email."
    )
    html_body = f"""
    <html>
      <body>
        <p>Welcome to Ai Tutor!</p>
        <p><a href=\"{link}\">Verify your email</a></p>
        <p>If you did not create this account, you can ignore this email.</p>
      </body>
    </html>
    """
    _send_email(subject, text_body, html_body, recipient_email)


def send_password_reset_email(recipient_email: str, token: str) -> None:
    link = build_app_link("/reset-password", token=token, email=recipient_email, action="reset-password")
    subject = "Reset your Ai Tutor password"
    text_body = (
        "You requested a password reset for Ai Tutor.\n\n"
        f"Reset your password here:\n{link}\n\n"
        "If you did not request this, you can ignore this email."
    )
    html_body = f"""
    <html>
      <body>
        <p>You requested a password reset for Ai Tutor.</p>
        <p><a href=\"{link}\">Reset your password</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </body>
    </html>
    """
    _send_email(subject, text_body, html_body, recipient_email)


def send_magic_link_email(recipient_email: str, token: str) -> None:
    link = build_app_link("/login", token=token, email=recipient_email, action="magic-link")
    subject = "Sign in to Ai Tutor"
    text_body = (
        "Use this magic link to sign in to Ai Tutor.\n\n"
        f"{link}\n\n"
        "If you did not request this email, you can ignore it."
    )
    html_body = f"""
    <html>
      <body>
        <p>Use this magic link to sign in to Ai Tutor.</p>
        <p><a href=\"{link}\">Sign in now</a></p>
        <p>If you did not request this email, you can ignore it.</p>
      </body>
    </html>
    """
    _send_email(subject, text_body, html_body, recipient_email)
