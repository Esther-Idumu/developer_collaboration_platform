import { Link } from "react-router-dom";
import OwnershipBadge from "../ui/OwnershipBadge/OwnershipBadge";
import AvatarStack from "../ui/AvatarStack/AvatarStack";
import StatusPill from "../ui/StatusPill/StatusPill";
import ApplicationBadge from "../ui/ApplicationBadge/ApplicationBadge";
import "./ProjectRow.css";

function ProjectRow({ project }) {
    const { id, title, role, status, members = [], capacity, newApplications = 0  } = project;

    return (
        <Link to={`/projects/${id}`} className="project-row">
                <h3 className="project-row-title">{title}</h3>
                <div className="project-row-role">
                    <OwnershipBadge role={role} />
                </div>
                <div className="project-row-team">
                    <AvatarStack people={members} max={2} size={24} />
                    <span className="project-row-members">
                        {members.length} / {capacity}
                    </span>
                </div>
                <div className="project-row-status">
                    <StatusPill status={status} />
                </div>
                <div className="project-row-applications">
                    <ApplicationBadge count={newApplications} />
                </div>
                <svg
                className="project-row-chevron"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m9 18 6-6-6-6" />
            </svg>
        </Link>
    )
}

export default ProjectRow;