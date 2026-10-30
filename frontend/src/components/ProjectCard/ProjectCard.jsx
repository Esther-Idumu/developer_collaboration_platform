import { Link } from "react-router-dom";
import StatusPill from "../ui/StatusPill/StatusPill";
import SkillTag from "../ui/SkillTag/SkillTag";
import AvatarStack from "../ui/AvatarStack/AvatarStack";
import Bookmark from "../ui/Bookmark/Bookmark";
import "./ProjectCard.css";

function ProjectCard({ project, onToggleSave }) {
    const { id, title, description, status, isSaved = false, skills = [], members = [], capacity } = project;

    return (
        <article className="project-card">
            <div className="project-card-heading">
                <div className="project-card-top">
                    <StatusPill status={status} />

                    {onToggleSave && (
                        <Bookmark saved={isSaved} onToggle={() => onToggleSave(id)} />
                    )}
                </div>
                <h3 className="project-card-title">{title}</h3>
            </div>
            
            <p className="project-card-description">{description}</p>

            {skills.length > 0 && (
                <div className="project-card-skills">
                    {skills.map((skill) => (
                        <SkillTag key={skill} title={skill} />
                    ))}
                </div>
            )}

            <div className="project-card-footer">
                <div className="project-card-team">
                    <AvatarStack people={members} max={2} size={24} />
                    <span className="project-card-members">
                        {members.length} / {capacity} members
                    </span>
                </div>

                <Link to={`/projects/${id}`} className="project-card-link">
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
                    >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                    </svg>
                </Link>
            </div>

        </article>
    );
}

export default ProjectCard;