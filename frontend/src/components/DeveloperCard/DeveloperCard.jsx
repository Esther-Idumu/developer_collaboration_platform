import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar/Avatar";
import SkillTag from "../ui/SkillTag/SkillTag";
import "./DeveloperCard.css";

function displayLink(url = "") {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function githubHandle(url = "") {
    return displayLink(url).split("/").pop();
}

function DeveloperCard({ developer }) {
    const { id, name, role, avatarUrl, skills = [], github, portfolio } = developer;

    return (
        <article className="developer-card">
            <div className="developer-card-header">
                <Avatar name={name} avatarUrl={avatarUrl} size={44} />

                <div className="developer-card-identity">
                    <h3 className="developer-card-name">{name}</h3>
                    {role && <p className="developer-card-role">{role}</p>}
                </div>
            </div>

            {skills.length > 0 && (
                <div className="developer-card-skills">
                    {skills.map((skill) => (
                        <SkillTag key={skill} title={skill} />
                    ))}
                </div>
            )}

            {(github || portfolio) && (
                <div className="developer-card-links">
                    {github && (
                        <a
                            href={github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="developer-card-link"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                <path d="M9 18c-4.51 2-5-2-7-2" />
                            </svg>
                            {githubHandle(github)}
                        </a>
                    )}

                    {portfolio && (
                        <a
                            href={portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="developer-card-link"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                <path d="M2 12h20" />
                            </svg>
                            {displayLink(portfolio)}
                        </a>
                    )}
                </div>
            )}

            <Link to={`/profile/${id}`} className="developer-card-button">
                View Profile
            </Link>
        </article>
    );
}

export default DeveloperCard;