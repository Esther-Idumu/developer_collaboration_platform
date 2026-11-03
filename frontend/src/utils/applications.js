import { formatDateTime } from "./time";

// The database calls a declined application "rejected"; the UI says "Declined".
export const APPLICATION_STATUS_LABELS = {
    pending: "Pending",
    accepted: "Accepted",
    rejected: "Declined",
    withdrawn: "Withdrawn",
};

export const PROJECT_STATUS_LABELS = {
    open: "Open",
    in_progress: "In progress",
    complete: "Complete",
};

// perspective: "received" (the project owner is looking) or "sent" (the applicant is looking)
export function buildTimeline(application, perspective) {
    const { status, createdAt, updatedAt, viewedAt, applicant, owner } = application;
    const received = perspective === "received";

    const steps = [
        {
            label: received ? "Application received" : "Application submitted",
            time: formatDateTime(createdAt),
            done: true,
        },
    ];

    if (viewedAt) {
        steps.push({
            label: received ? "You viewed it" : `Viewed by ${owner.name}`,
            time: formatDateTime(viewedAt),
            done: true,
        });
    }

    if (status === "pending") {
        steps.push({
            label: received ? "Awaiting your decision" : "Awaiting a decision",
            done: false,
        });
    } else {
        const labels = {
            accepted: received ? "You accepted this application" : "Application accepted",
            rejected: received ? "You declined this application" : "Application declined",
            withdrawn: received ? `${applicant.name} withdrew this application` : "You withdrew this application",
        };

        steps.push({ label: labels[status], time: formatDateTime(updatedAt), done: true });
    }

    return steps;
}
