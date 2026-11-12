import dj_database_url
from pathlib import Path
from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = config('SECRET_KEY')


DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'rest_framework',
    'corsheaders',
    'projects'
]


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]


ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases


DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True



STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

STORAGES = {
    'default': {
        'BACKEND': 'django.core.files.storage.FileSystemStorage',
    },
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}


# Uploaded files (profile photos)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


_smtp_host = config('EMAIL_HOST', default='')
_use_ssl = config('EMAIL_USE_SSL', default=False, cast=bool)

if _smtp_host:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = _smtp_host
    EMAIL_PORT = config(
        'EMAIL_PORT',
        default=465 if _use_ssl else 587,
        cast=int
    )
    EMAIL_HOST_USER = config('EMAIL_HOST_USER', default='')
    EMAIL_HOST_PASSWORD = config('EMAIL_HOST_PASSWORD', default='')
    EMAIL_USE_SSL = _use_ssl
    EMAIL_USE_TLS = not _use_ssl
    EMAIL_TIMEOUT = 10

else:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

DEFAULT_FROM_EMAIL = config(
    'DEFAULT_FROM_EMAIL',
    default=EMAIL_HOST_USER if _smtp_host else 'DevLink <devlinkapp26@gmail.com>'
)

FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:5173').rstrip('/')

AUTH_USER_MODEL = 'accounts.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:5173,http://localhost:5174',
    cast=Csv(),
)

# How long a verification link stays valid (Django reuses the password reset timeout for it).
PASSWORD_RESET_TIMEOUT = 60 * 60 * 24

if not DEBUG:
    # Loud reminders for settings that fail silently otherwise (they show up in the server logs).
    import warnings

    if not _smtp_host:
        warnings.warn(
            "EMAIL_HOST is not set: verification emails are only printed to the server log and "
            "never delivered. Set EMAIL_HOST, EMAIL_HOST_USER and EMAIL_HOST_PASSWORD.",
            RuntimeWarning,
        )

    if FRONTEND_URL.startswith('http://localhost'):
        warnings.warn(
            "FRONTEND_URL is still the localhost default: links in verification emails will point "
            "to localhost. Set FRONTEND_URL to your site's address.",
            RuntimeWarning,
        )

    if not config('DEFAULT_FROM_EMAIL', default='') and not _smtp_host:
        warnings.warn(
            "DEFAULT_FROM_EMAIL is not explicitly configured.",
            RuntimeWarning,
        )

    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    CSRF_TRUSTED_ORIGINS = config('CSRF_TRUSTED_ORIGINS', default='', cast=Csv())
    # Set to True when the app sits behind a proxy that terminates HTTPS (Render, Railway, Nginx...).
    if config('BEHIND_HTTPS_PROXY', default=False, cast=bool):
        SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
