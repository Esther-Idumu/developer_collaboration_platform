import "./OwnershipBadge.css";

const BADGE_LABELS = {
    owner: "Owner",
    member: "Member"
}

function OwnershipBadge({ role }) {
    const label = BADGE_LABELS[role]

    if (!label) {
        return null;
    }

    return (
        <span className={`ownership-badge ownership-badge-${role}`}>
            {label}
        </span>
    );
}

export default OwnershipBadge;