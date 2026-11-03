import { Link } from "react-router-dom";
import StatusPill from "../ui/StatusPill/StatusPill";
import ApplicationBadge from "../ui/ApplicationBadge/ApplicationBadge";
import OwnershipBadge from "../ui/OwnershipBadge/OwnershipBadge";
import AvatarStack from "../ui/AvatarStack/AvatarStack";
import Bookmark from "../ui/Bookmark/Bookmark";
import "./MyProjectCard.css";

function MyProjectCard({ project, onUnsave, isUnsaving = false }) {
    const { id, title, description, status, role, newApplications = 0, members = [], capacity } = project;

    const hasBadges = newApplications > 0 || Boolean(role);

    return (
        <article className="my-project-card">
            <div className="my-project-card-top">
                <StatusPill status={status} />

                {onUnsave && (
                    <Bookmark saved onToggle={() => !isUnsaving && onUnsave(id)} />
                )}
            </div>

            <h3 className="my-project-card-title">{title}</h3>

            <p className="my-project-card-description">{description}</p>

            {hasBadges && (
                <div className="my-project-card-badges">
                    <ApplicationBadge count={newApplications} />
                    <OwnershipBadge role={role} />
                </div>
            )}

            <div className="my-project-card-footer">
                <div className="my-project-card-team">
                    <AvatarStack people={members} max={2} size={28} />
                    <span className="my-project-card-members">
                        {members.length} / {capacity} members
                    </span>
                </div>

                <Link to={`/projects/${id}`} className="my-project-card-link">
                    View Project
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </Link>
            </div>
        </article>
    );
}

export default MyProjectCard;
