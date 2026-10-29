import "./ApplicationBadge.css";

function ApplicationBadge ({ count = 0 }) {
    if (count <= 0) {
        return null;
    }

    return (
        <span className="application-badge">
            {count} new {count === 1 ? "application" : "applications"}
        </span>
    );
}

export default ApplicationBadge;