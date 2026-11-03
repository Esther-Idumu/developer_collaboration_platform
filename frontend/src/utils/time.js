// "2026-10-15T09:30:00Z" -> "2h ago", "3d ago", "Oct 15"
export function timeAgo(isoDate) {
    if (!isoDate) {
        return "";
    }

    const date = new Date(isoDate);
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

    if (seconds < 60) return "Just now";

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;

    const sameYear = date.getFullYear() === new Date().getFullYear();

    return date.toLocaleDateString("en-US", sameYear
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" });
}

// "2026-10-15T13:30:00Z" -> "Oct 15, 1:30 PM"
export function formatDateTime(isoDate) {
    if (!isoDate) {
        return "";
    }

    return new Date(isoDate).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}
