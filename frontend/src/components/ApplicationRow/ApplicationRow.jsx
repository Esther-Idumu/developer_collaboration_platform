import Avatar from "../ui/Avatar/Avatar";
import StatusDot from "../ui/StatusDot/StatusDot";
import ApplicationStatusPill from "../ui/ApplicationStatusPill/ApplicationStatusPill";
import { timeAgo } from "../../utils/time";
import "./ApplicationRow.css";

function ApplicationRow({ application, perspective, onOpen }) {
    const { status, role, project, createdAt, viewedAt, applicant, owner } = application;
    const received = perspective === "received";

    const person = received ? applicant : owner;
    const isUnread = received && !viewedAt;

    return (
        <button type="button" className="application-row" onClick={() => onOpen(application)}>
            <span className="application-row-person">
                <span className="application-row-avatar">
                    <Avatar name={person.name} avatarUrl={person.avatarUrl} size={54} />
                    {isUnread && <span className="application-row-unread" role="img" aria-label="Not viewed yet" />}
                </span>

                <span className="application-row-text">
                    <span className="application-row-name">{received ? person.name : project.title}</span>
                    <span className="application-row-role">{role}</span>
                </span>
            </span>

            <span className="application-row-middle">
                {received ? (
                    <>
                        <StatusDot status={project.status} />
                        <span className="application-row-middle-text">{project.title}</span>
                    </>
                ) : (
                    <span className="application-row-middle-text">Owned by {owner.name}</span>
                )}
            </span>

            <span className="application-row-status">
                <ApplicationStatusPill status={status} />
            </span>

            <span className="application-row-time">{timeAgo(createdAt)}</span>

            <svg
                className="application-row-chevron"
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
                <path d="m9 18 6-6-6-6" />
            </svg>
        </button>
    );
}

export default ApplicationRow;
