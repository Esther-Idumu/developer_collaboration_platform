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

// "2026-11-04T10:09:00Z" -> "10:09" (24-hour, in the viewer's timezone)
export function formatClock(isoDate) {
    if (!isoDate) {
        return "";
    }

    return new Date(isoDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function startOfDay(date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(date, now = new Date()) {
    return Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
}

// Chat list timestamp: today "10:09", this week "Mon", older "Oct 15"
export function formatChatListTime(isoDate) {
    if (!isoDate) {
        return "";
    }

    const date = new Date(isoDate);
    const days = daysBetween(date);

    if (days <= 0) return formatClock(isoDate);
    if (days < 7) return date.toLocaleDateString("en-US", { weekday: "short" });

    return date.toLocaleDateString("en-US", date.getFullYear() === new Date().getFullYear()
        ? { month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" });
}

// Divider between days in a conversation: "Today", "Yesterday", "Mon, Oct 5"
export function formatDayLabel(isoDate) {
    const date = new Date(isoDate);
    const days = daysBetween(date);

    if (days <= 0) return "Today";
    if (days === 1) return "Yesterday";

    return date.toLocaleDateString("en-US", date.getFullYear() === new Date().getFullYear()
        ? { weekday: "short", month: "short", day: "numeric" }
        : { month: "short", day: "numeric", year: "numeric" });
}

// Used to start a new day divider and to group messages sent close together.
export function dayKey(isoDate) {
    const date = new Date(isoDate);
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

