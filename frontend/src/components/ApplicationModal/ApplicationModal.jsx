import { useState } from "react";
import Modal from "../Modal/Modal";
import Avatar from "../ui/Avatar/Avatar";
import Button from "../ui/Button/Button";
import SkillTag from "../ui/SkillTag/SkillTag";
import StatusDot from "../ui/StatusDot/StatusDot";
import ApplicationStatusPill from "../ui/ApplicationStatusPill/ApplicationStatusPill";
import { buildTimeline, PROJECT_STATUS_LABELS } from "../../utils/applications";
import { formatDateTime } from "../../utils/time";
import { displayLink, githubHandle } from "../../utils/links";
import "./ApplicationModal.css";

function Fact({ label, children }) {
    return (
        <div className="application-fact">
            <dt>{label}</dt>
            <dd>{children}</dd>
        </div>
    );
}

// perspective "received": the owner reviews an applicant (Accept / Decline).
// perspective "sent": the applicant looks at their own application (Withdraw).
function ApplicationModal({ application, perspective, isBusy, error, onClose, onAccept, onDecline, onWithdraw }) {
    const [confirmingDecline, setConfirmingDecline] = useState(false);

    const received = perspective === "received";
    const { status, role, project, message, createdAt, applicant, owner } = application;
    const isPending = status === "pending";
    const timeline = buildTimeline(application, perspective);

    // Escape closes the decline prompt first, then the modal.
    function handleClose() {
        if (confirmingDecline) {
            setConfirmingDecline(false);
            return;
        }

        onClose();
    }

    return (
        <Modal
            size="lg"
            title={received ? `${applicant.name}'s application` : `Your application to ${project.title}`}
            onClose={handleClose}
            isBusy={isBusy}
        >
            <div className="application-modal-scroll">
                <header className="application-modal-header">
                    {received ? (
                        <>
                            <Avatar name={applicant.name} avatarUrl={applicant.avatarUrl} size={66} />

                            <div className="application-modal-heading">
                                <h2 className="application-modal-title">{applicant.name}</h2>
                                {applicant.headline && <p className="application-modal-subtitle">{applicant.headline}</p>}
                            </div>
                        </>
                    ) : (
                        <>
                            <StatusDot status={project.status} />

                            <div className="application-modal-heading">
                                <h2 className="application-modal-title">{project.title}</h2>
                                <p className="application-modal-subtitle">Owned by {owner.name}</p>
                            </div>
                        </>
                    )}

                    <ApplicationStatusPill status={status} />

                    <button type="button" className="application-modal-close" aria-label="Close" disabled={isBusy} onClick={handleClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18" />
                            <path d="m6 6 12 12" />
                        </svg>
                    </button>
                </header>

                <dl className="application-facts">
                    <Fact label="Role">{role}</Fact>

                    {received ? (
                        <Fact label="Project">
                            <StatusDot status={project.status} />
                            {project.title}
                        </Fact>
                    ) : (
                        <Fact label="Owner">
                            <Avatar name={owner.name} avatarUrl={owner.avatarUrl} size={26} />
                            {owner.name}
                        </Fact>
                    )}

                    <Fact label="Submitted">{formatDateTime(createdAt)}</Fact>

                    {!received && (
                        <Fact label="Project status">
                            <StatusDot status={project.status} />
                            {PROJECT_STATUS_LABELS[project.status]}
                        </Fact>
                    )}
                </dl>

                <section className="application-section">
                    <h3 className="application-section-title">{received ? "Message from applicant" : "Your message"}</h3>
                    <p className="application-message">{message}</p>
                </section>

                {applicant.skills.length > 0 && (
                    <section className="application-section">
                        <h3 className="application-section-title">{received ? "Skills" : "Your skills"}</h3>
                        <div className="application-skills">
                            {applicant.skills.map((skill) => (
                                <SkillTag key={skill} title={skill} />
                            ))}
                        </div>
                    </section>
                )}

                {received && (applicant.github || applicant.portfolio) && (
                    <section className="application-section">
                        <h3 className="application-section-title">Links</h3>
                        <div className="application-links">
                            {applicant.github && (
                                <a href={applicant.github} target="_blank" rel="noopener noreferrer" className="application-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                                        <path d="M9 18c-4.51 2-5-2-7-2" />
                                    </svg>
                                    {githubHandle(applicant.github)}
                                </a>
                            )}

                            {applicant.portfolio && (
                                <a href={applicant.portfolio} target="_blank" rel="noopener noreferrer" className="application-link">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                                        <path d="M2 12h20" />
                                    </svg>
                                    {displayLink(applicant.portfolio)}
                                </a>
                            )}
                        </div>
                    </section>
                )}

                <section className="application-section">
                    <h3 className="application-section-title">Activity</h3>

                    <ol className="application-timeline">
                        {timeline.map((step) => (
                            <li key={step.label} className={step.done ? "application-step" : "application-step application-step-open"}>
                                <span className="application-step-marker" aria-hidden="true" />
                                <div>
                                    <p className="application-step-label">{step.label}</p>
                                    {step.time && <p className="application-step-time">{step.time}</p>}
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            </div>

            {isPending && (
                <footer className="application-modal-footer">
                    {error && <p className="application-modal-error" role="alert">{error}</p>}

                    {received ? (
                        <>
                            <Button disabled={isBusy} onClick={() => setConfirmingDecline(true)}>
                                Decline
                            </Button>

                            <Button
                                variant="primary"
                                disabled={isBusy}
                                onClick={onAccept}
                                icon={
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M20 6 9 17l-5-5" />
                                    </svg>
                                }
                            >
                                {isBusy ? "Saving..." : "Accept"}
                            </Button>
                        </>
                    ) : (
                        <Button disabled={isBusy} onClick={onWithdraw}>
                            {isBusy ? "Withdrawing..." : "Withdraw application"}
                        </Button>
                    )}
                </footer>
            )}

            {confirmingDecline && (
                <div className="application-confirm">
                    <div className="application-confirm-card" role="alertdialog" aria-labelledby="decline-title">
                        <h3 className="application-confirm-title" id="decline-title">
                            Decline {applicant.name}'s application?
                        </h3>
                        <p className="application-confirm-text">
                            They won't be added to {project.title}. This can't be undone.
                        </p>

                        {error && <p className="application-modal-error" role="alert">{error}</p>}

                        <div className="application-confirm-actions">
                            <Button disabled={isBusy} onClick={() => setConfirmingDecline(false)}>
                                Cancel
                            </Button>

                            <button type="button" className="button button-danger" disabled={isBusy} onClick={onDecline}>
                                {isBusy ? "Declining..." : "Decline"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Modal>
    );
}

export default ApplicationModal;
