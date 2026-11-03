import { useId, useState } from "react";
import SectionCard from "../SectionCard/SectionCard";
import Button from "../ui/Button/Button";
import SkillTag from "../ui/SkillTag/SkillTag";
import { updateMyProfile } from "../../api/endpoints";
import "./ProfileEdit.css";

const MAX_BIO = 280;
const MAX_SKILLS = 30;

function withSkill(list, raw) {
    const title = raw.trim().replace(/\s+/g, " ");

    if (!title || list.some((skill) => skill.toLowerCase() === title.toLowerCase())) {
        return list;
    }

    return [...list, title];
}

function sameSkills(a, b) {
    return a.length === b.length && a.every((title) => b.some((other) => other.toLowerCase() === title.toLowerCase()));
}

function AboutSkillsEditor({ profile, onCancel, onSaved }) {
    const formId = useId();
    const skillInputId = useId();

    const [bio, setBio] = useState(profile.bio);
    const [skills, setSkills] = useState(profile.skill_titles);
    const [pendingSkill, setPendingSkill] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function handleSkillKeyDown(event) {
        if (event.key !== "Enter") {
            return;
        }

        event.preventDefault();

        const next = withSkill(skills, pendingSkill);

        if (next.length > MAX_SKILLS) {
            setError(`You can add up to ${MAX_SKILLS} skills.`);
            return;
        }

        setError("");
        setSkills(next);
        setPendingSkill("");
    }

    function removeSkill(title) {
        setError("");
        setSkills((current) => current.filter((skill) => skill !== title));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const finalSkills = withSkill(skills, pendingSkill);

        if (finalSkills.length > MAX_SKILLS) {
            setError(`You can add up to ${MAX_SKILLS} skills.`);
            return;
        }

        const changes = {};

        if (bio.trim() !== profile.bio) {
            changes.bio = bio.trim();
        }

        if (!sameSkills(finalSkills, profile.skill_titles)) {
            changes.skill_titles = finalSkills;
        }

        if (Object.keys(changes).length === 0) {
            onCancel();
            return;
        }

        setIsSaving(true);
        setError("");

        try {
            const updated = await updateMyProfile(changes);
            onSaved(updated);
        } catch (requestError) {
            setError(requestError.message);
            setIsSaving(false);
        }
    }

    return (
        <SectionCard
            title="About & skills"
            className="profile-card section-card-editing"
            actions={
                <>
                    <Button size="sm" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                    <Button size="sm" variant="primary" type="submit" form={formId} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </>
            }
        >
            <form id={formId} className="profile-form-stack" onSubmit={handleSubmit} noValidate>
                <label className="form-field">
                    <span className="form-label">Bio</span>
                    <textarea
                        className="form-input form-textarea"
                        rows={4}
                        value={bio}
                        maxLength={MAX_BIO}
                        onChange={(event) => setBio(event.target.value)}
                        autoFocus
                    />
                    <span className="form-counter">{bio.length} / {MAX_BIO}</span>
                </label>

                <div className="form-field">
                    <label className="form-label" htmlFor={skillInputId}>Skills</label>

                    {skills.length > 0 && (
                        <div className="skill-chips">
                            {skills.map((skill) => (
                                <span key={skill} className="skill-chip">
                                    {skill}
                                    <button type="button" aria-label={`Remove ${skill}`} onClick={() => removeSkill(skill)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}

                    <input
                        id={skillInputId}
                        className="form-input"
                        type="text"
                        value={pendingSkill}
                        maxLength={50}
                        placeholder="Type a skill and press Enter"
                        onChange={(event) => setPendingSkill(event.target.value)}
                        onKeyDown={handleSkillKeyDown}
                    />
                </div>
            </form>

            {error && <p className="form-error" role="alert">{error}</p>}
        </SectionCard>
    );
}

function AboutSkillsCard({ profile, isOwn, isEditing, isLocked, onEdit, onCancel, onSaved }) {
    if (isEditing) {
        return <AboutSkillsEditor profile={profile} onCancel={onCancel} onSaved={onSaved} />;
    }

    return (
        <SectionCard
            title="About & skills"
            className="profile-card"
            actions={isOwn && <Button size="sm" onClick={onEdit} disabled={isLocked}>Edit</Button>}
        >
            {profile.bio ? (
                <p className="profile-bio">{profile.bio}</p>
            ) : (
                <p className="profile-empty">No bio yet.</p>
            )}

            {profile.skill_titles.length > 0 ? (
                <div className="profile-skills">
                    {profile.skill_titles.map((title) => (
                        <SkillTag key={title} title={title} />
                    ))}
                </div>
            ) : (
                <p className="profile-empty">No skills added yet.</p>
            )}
        </SectionCard>
    );
}

export default AboutSkillsCard;
