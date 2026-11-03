import { APPLICATION_STATUS_LABELS } from "../../../utils/applications";
import "./ApplicationStatusPill.css";

function ApplicationStatusPill({ status }) {
    const label = APPLICATION_STATUS_LABELS[status];

    if (!label) {
        return null;
    }

    return (
        <span className={`application-status application-status-${status}`}>
            {label}
        </span>
    );
}

export default ApplicationStatusPill;
