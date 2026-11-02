export function getDisplayName(user) {
    const fullName = user?.profile?.full_name?.trim();
    return fullName || user?.email?.split("@")[0] || "";
}

export function getHeadline(user) {
    return user?.profile?.headline?.trim() || "Developer";
}
