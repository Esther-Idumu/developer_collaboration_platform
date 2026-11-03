// "2026-10-14T09:30:00Z" -> "Oct 2026"
export function formatMonthYear(isoDate) {
    if (!isoDate) {
        return "";
    }

    return new Date(isoDate).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
