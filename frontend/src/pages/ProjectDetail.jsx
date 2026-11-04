import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { getProject, saveProject, unsaveProject } from "../api/endpoints";
import { APPLICATION_STATUS_LABELS } from "../utils/applications";
import { displayLink, githubHandle } from "../utils/links";
import { timeAgo } from "../utils/time";
import PageHeader from "../components/PageHeader/PageHeader";
import ApplyModal from "../components/ApplyModal/ApplyModal";
import Avatar from "../components/ui/Avatar/Avatar";
import Button from "../components/ui/Button/Button";
import SkillTag from "../components/ui/SkillTag/SkillTag";
import StatusPill from "../components/ui/StatusPill/StatusPill";
import "./ProjectDetail.css";

function parseDescription(text) {
    return text
        .trim()
        .split(/\n{2,}/)
        .map((block) => {
            const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
            const isList = lines.length > 0 && lines.every((line) => /^[-*•]\s+/.test(line));

            return isList
                ? { type: "list", items: lines.map((line) => line.replace(/^[-*•]\s+/, "")) }
                : { type: "text", text: lines.join("\n") };
        })
        .filter((block) => block.type === "list" || block.text);
}

function Message({ children, error = false }) {
    return <p className={`project-message ${error ? "project-message-error" : ""}`}>{children}</p>;
}

function Section({ title, aside, id, children }) {
    return (
        <section className="project-card" id={id}>
            <header className="project-card-header">
                <h2 className="project-card-title">{title}</h2>
                {aside}
            </header>

            {children}
        </section>
    );
}

function ProjectDetailContent({ id }) {
    const { user } = useAuth();

    const fetchProject = useCallback((signal) => getProject(id, signal), [id]);
    const { data: project, error, isLoading } = useFetch(fetchProject);

    const [savedOverride, setSavedOverride] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");    // Applications sent from this page, by role id (the page data only knows about earlier ones).
    const [sentApplications, setSentApplications] = useState({});
    const [applyingTo, setApplyingTo] = useState(null);

    if (isLoading) {
        return (
            <>
                <PageHeader title="Project" fallbackTo="/my-projects" />
                <Message>Loading project...</Message>
            </>
        );
    }

    if (error) {
        const notFound = error.status === 404;

        return (
            <>
                <PageHeader title="Project" fallbackTo="/my-projects" />
                <Message error={!notFound}>
                    {notFound ? "This project doesn't exist." : `We couldn't load this project. ${error.message}`}
                </Message>
            </>
        );
    }

    const isSaved = savedOverride ?? project.isSaved;
    const isVisitor = !project.role && project.owner.id !== user.id;
    const isOpen = project.status === "open";

    const applicationFor = (role) => sentApplications[role.id] ?? role.myApplication;
    const openRoles = project.roles.filter((role) => role.filled < role.noOfDevelopers);
    const canApply = isVisitor && isOpen;
    const hasRoleToApplyTo = canApply && openRoles.some((role) => !applicationFor(role));

    const spotsOpen = Math.max(0, project.capacity - project.team.length);

    const blocks = parseDescription(project.description);
    const summary = blocks[0]?.type === "text" ? blocks[0].text : "";
    const aboutBlocks = summary ? blocks.slice(1) : blocks;

    const posted = timeAgo(project.createdAt);

    async function handleToggleSave() {
        setIsSaving(true);
        setSaveError("");

        try {
            if (isSaved) {
                await unsaveProject(project.id);
                setSavedOverride(false);
            } else {
                await saveProject(project.id);
                setSavedOverride(true);
            }
        } catch (requestError) {
            setSaveError(requestError.message);
        } finally {
            setIsSaving(false);
        }
    }

    function scrollToRoles() {
        document.getElementById("open-roles")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function handleApplied(roleId, application) {
        setSentApplications((current) => ({
            ...current,
            [roleId]: { id: application.id, status: application.status },
        }));
        setApplyingTo(null);
    }

    const people = [
        { ...project.owner, isOwner: true, subtitle: project.owner.headline },
        ...project.team.map((member) => ({
            ...member,
            isOwner: false,
            subtitle: member.roles.join(", ") || member.headline,
        })),
    ];

    return (
        <div className="project-page">
            <PageHeader title="Project" fallbackTo="/my-projects" />

            <section className="project-card project-hero">
                <div className="project-hero-main">
                    <div className="project-hero-title-row">
                        <h2 className="project-hero-title">{project.title}</h2>
                        <StatusPill status={project.status} />
                    </div>

                    {summary && <p className="project-hero-summary">{summary}</p>}

                    {project.skills.length > 0 && (
                        <div className="project-tags">
                            {project.skills.map((skill) => (
                                <SkillTag key={skill} title={skill} />
                            ))}
                        </div>
                    )}
                </div>

                {isVisitor && isOpen && (
                    <div className="project-hero-actions">
                        <div className="project-hero-buttons">
                            <Button
                                size="sm"
                                disabled={isSaving}
                                onClick={handleToggleSave}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                                    </svg>
                                }
                            >
                                {isSaved ? "Saved" : "Save"}
                            </Button>

                            {hasRoleToApplyTo && (
                                <Button variant="primary" size="sm" onClick={scrollToRoles}>
                                    Apply to join
                                </Button>
                            )}
                        </div>

                        {saveError && <p className="project-hero-error" role="alert">{saveError}</p>}
                    </div>
                )}

                <div className="project-owner-row">
                    <Link to={`/profile/${project.owner.id}`} className="project-owner-link">
                        <Avatar name={project.owner.name} avatarUrl={project.owner.avatarUrl} size={24} />
                        <span className="project-owner-name">{project.owner.name}</span>
                    </Link>
                    <span className="project-owner-label">· Owner</span>

                    <span className="project-meta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                        {posted === "Just now" ? "Posted just now" : `Posted ${posted}`}
                    </span>

                    <span className="project-meta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        {project.team.length} / {project.capacity} members
                    </span>
                </div>
            </section>

            <div className="project-columns">
                <div className="project-column">
                    {aboutBlocks.length > 0 && (
                        <Section title="About this project">
                            <div className="project-about">
                                {aboutBlocks.map((block, index) =>
                                    block.type === "list" ? (
                                        <ul key={index} className="project-about-list">
                                            {block.items.map((item) => (
                                                <li key={item}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p key={index} className="project-about-text">{block.text}</p>
                                    )
                                )}
                            </div>
                        </Section>
                    )}

                    <Section
                        id="open-roles"
                        title="Open roles"
                        aside={<span className="project-count-pill">{openRoles.length} open</span>}
                    >
                        {openRoles.length === 0 && <Message>All roles on this project are filled.</Message>}

                        <ul className="project-roles">
                            {openRoles.map((role) => {
                                const application = applicationFor(role);

                                return (
                                    <li key={role.id} className="project-role">
                                        <div className="project-role-main">
                                            <h3 className="project-role-title">{role.title}</h3>

                                            {role.skills.length > 0 && (
                                                <div className="project-tags">
                                                    {role.skills.map((skill) => (
                                                        <SkillTag key={skill} title={skill} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {canApply && !application && (
                                            <Button size="sm" onClick={() => setApplyingTo(role)}>
                                                Apply
                                            </Button>
                                        )}

                                        {application && (
                                            <span className="project-role-status">
                                                Application {APPLICATION_STATUS_LABELS[application.status].toLowerCase()}
                                            </span>
                                        )}

                                        {!canApply && !application && (
                                            <span className="project-role-status">
                                                {role.filled} / {role.noOfDevelopers} filled
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </Section>
                </div>

                <div className="project-column">
                    <Section
                        title="Team"
                        aside={<span className="project-team-count">{project.team.length} of {project.capacity}</span>}
                    >
                        <ul className="project-team">
                            {people.map((person) => (
                                <li key={`${person.isOwner ? "owner" : "member"}-${person.id}`}>
                                    <Link to={`/profile/${person.id}`} className="project-team-row">
                                        <Avatar name={person.name} avatarUrl={person.avatarUrl} size={36} />

                                        <span className="project-team-text">
                                            <span className="project-team-name">{person.name}</span>
                                            {person.subtitle && <span className="project-team-sub">{person.subtitle}</span>}
                                        </span>

                                        <span className={`project-team-badge ${person.isOwner ? "project-team-badge-owner" : ""}`}>
                                            {person.isOwner ? "Owner" : "Member"}
                                        </span>
                                    </Link>
                                </li>
                            ))}

                            {spotsOpen > 0 && (
                                <li className="project-team-open">
                                    <span className="project-team-open-circle" aria-hidden="true" />
                                    {spotsOpen} {spotsOpen === 1 ? "spot" : "spots"} open
                                </li>
                            )}
                        </ul>
                    </Section>

                    {(project.githubUrl || project.websiteUrl) && (
                        <Section title="Links">
                            <ul className="project-links">
                                {project.githubUrl && (
                                    <li>
                                        <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                                <path d="M9 18c-4.51 2-5-2-7-2" />
                                            </svg>
                                            {githubHandle(project.githubUrl)}
                                        </a>
                                    </li>
                                )}

                                {project.websiteUrl && (
                                    <li>
                                        <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="project-link">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                <circle cx="12" cy="12" r="10" />
                                                <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                                <path d="M2 12h20" />
                                            </svg>
                                            {displayLink(project.websiteUrl)}
                                        </a>
                                    </li>
                                )}
                            </ul>
                        </Section>
                    )}
                </div>
            </div>

            {applyingTo && (
                <ApplyModal
                    role={applyingTo}
                    projectTitle={project.title}
                    onClose={() => setApplyingTo(null)}
                    onApplied={handleApplied}
                />
            )}
        </div>
    );
}

function ProjectDetail() {
    const { id } = useParams();

    return <ProjectDetailContent key={id} id={id} />;
}

export default ProjectDetail;
