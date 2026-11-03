import "./StatusDot.css";

function StatusDot({ status }) {
    return <span className={`status-dot status-dot-${status}`} aria-hidden="true" />;
}

export default StatusDot;
