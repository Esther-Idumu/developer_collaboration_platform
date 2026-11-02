def get_display_name(user):
    profile = getattr(user, 'profile', None)
    full_name = profile.full_name.strip() if profile else ''
    return full_name or user.email.split('@')[0]
