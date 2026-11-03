import { useId, useState } from "react";
import SectionCard from "../SectionCard/SectionCard";
import Button from "../ui/Button/Button";
import { updateMyProfile } from "../../api/endpoints";
import { formatMonthYear } from "../../utils/format";
import { displayLink, githubHandle, normalizeGithub, normalizePortfolio } from "../../utils/links";
import "./ProfileEdit.css";

function Field({ label, children }) {
    return (
        <div className="profile-field">
            <dt className="profile-field-label">{label}</dt>
            <dd className="profile-field-value">{children}</dd>
        </div>
    );
}

function PersonalInfoEditor({ profile, onCancel, onSaved }) {
    const formId = useId();

    const [initial] = useState(() => ({
        headline: profile.headline,
        availability: profile.open_to_collaborate ? "open" : "closed",
        github: githubHandle(profile.github),
        portfolio: displayLink(profile.portfolio),
    }));

    const [draft, setDraft] = useState(initial);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    function setField(name, value) {
        setDraft((current) => ({ ...current, [name]: value }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const changes = {};

        if (draft.headline.trim() !== initial.headline) {
            changes.headline = draft.headline.trim();
        }

        if (draft.availability !== initial.availability) {
            changes.open_to_collaborate = draft.availability === "open";
        }

        if (draft.github.trim() !== initial.github) {
            const github = normalizeGithub(draft.github);

            if (github === null) {
                setError("Enter your GitHub username, for example esther-idumu.");
                return;
            }

            changes.github = github;
        }

        if (draft.portfolio.trim() !== initial.portfolio) {
            const portfolio = normalizePortfolio(draft.portfolio);

            if (portfolio === null) {
                setError("Enter a valid website address, for example yourname.dev.");
                return;
            }

            changes.portfolio = portfolio;
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
            title="Personal information"
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
            <form id={formId} className="profile-fields" onSubmit={handleSubmit} noValidate>
                <label className="form-field">
                    <span className="form-label">Role</span>
                    <input
                        className="form-input"
                        type="text"
                        value={draft.headline}
                        maxLength={100}
                        placeholder="Developer"
                        onChange={(event) => setField("headline", event.target.value)}
                        autoFocus
                    />
                </label>

                <div className="form-field">
                    <span className="form-label">Member since</span>
                    <span className="form-static">{formatMonthYear(profile.joined_at)}</span>
                </div>

                <label className="form-field">
                    <span className="form-label">Availability</span>
                    <select
                        className="form-input form-select"
                        value={draft.availability}
                        onChange={(event) => setField("availability", event.target.value)}
                    >
                        <option value="open">Open to collaborate</option>
                        <option value="closed">Not available right now</option>
                    </select>
                </label>

                <label className="form-field">
                    <span className="form-label">GitHub</span>
                    <input
                        className="form-input"
                        type="text"
                        value={draft.github}
                        placeholder="username"
                        onChange={(event) => setField("github", event.target.value)}
                    />
                </label>

                <label className="form-field">
                    <span className="form-label">Portfolio</span>
                    <input
                        className="form-input"
                        type="text"
                        value={draft.portfolio}
                        placeholder="yourname.dev"
                        onChange={(event) => setField("portfolio", event.target.value)}
                    />
                </label>
            </form>

            {error && <p className="form-error" role="alert">{error}</p>}
        </SectionCard>
    );
}

function PersonalInfoCard({ profile, isOwn, isEditing, isLocked, onEdit, onCancel, onSaved }) {
    if (isEditing) {
        return <PersonalInfoEditor profile={profile} onCancel={onCancel} onSaved={onSaved} />;
    }

    const role = profile.headline || "Developer";

    return (
        <SectionCard
            title="Personal information"
            className="profile-card"
            actions={isOwn && <Button size="sm" onClick={onEdit} disabled={isLocked}>Edit</Button>}
        >
            <dl className="profile-fields">
                <Field label="Role">{role}</Field>
                <Field label="Member since">{formatMonthYear(profile.joined_at)}</Field>
                <Field label="Availability">
                    {profile.open_to_collaborate ? "Open to collaborate" : "Not available right now"}
                </Field>
                <Field label="GitHub">
                    {profile.github ? (
                        <a href={profile.github} target="_blank" rel="noreferrer">{githubHandle(profile.github)}</a>
                    ) : (
                        "\u2014"
                    )}
                </Field>
                <Field label="Portfolio">
                    {profile.portfolio ? (
                        <a href={profile.portfolio} target="_blank" rel="noreferrer">{displayLink(profile.portfolio)}</a>
                    ) : (
                        "\u2014"
                    )}
                </Field>
            </dl>
        </SectionCard>
    );
}

export default PersonalInfoCard;
