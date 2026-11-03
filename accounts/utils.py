def get_display_name(user):
    profile = getattr(user, 'profile', None)
    full_name = profile.full_name.strip() if profile else ''
    return full_name or user.email.split('@')[0]

def get_avatar_url(profile, request=None):
    """Absolute URL of a profile photo (so the frontend on another port can load it), or None."""
    if profile is None or not profile.avatar:
        return None
    url = profile.avatar.url
    return request.build_absolute_uri(url) if request else url
