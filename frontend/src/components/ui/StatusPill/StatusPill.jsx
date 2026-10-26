import "./StatusPill.css";

const STATUS_LABELS = {
    open: "Open",
    in_progress: "In progress",
    complete: "Complete"
};

function StatusPill({ status }) {
    const label = STATUS_LABELS[status];

    if (!label) {
        return null;
    }

    return (
        <span className={`status-pill status-${status}`}>
            {label}
        </span>
    );
}

export default StatusPill;