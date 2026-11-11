import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addProjectRole, createProject, getRoles, getSkills } from "../api/endpoints";
import Button from "../components/ui/Button/Button";
import PageHeader from "../components/PageHeader/PageHeader";
import "../components/profile/ProfileEdit.css";
import "./CreateProject.css";

let nextRowKey = 1;

function newRoleRow() {
    return { key: nextRowKey++, roleId: "", count: 1, skillIds: [], saved: false };
}

function CreateProject() {
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [rows, setRows] = useState([]);

    const [roles, setRoles] = useState([]);
    const [skills, setSkills] = useState([]);
    const [optionsError, setOptionsError] = useState("");

    // Set once the project exists, so a retry only adds the roles that failed.
    const [createdProjectId, setCreatedProjectId] = useState(null);
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        Promise.all([getRoles(controller.signal), getSkills(controller.signal)])
            .then(([loadedRoles, loadedSkills]) => {
                setRoles(loadedRoles);
                setSkills(loadedSkills);
            })
            .catch((requestError) => {
                if (requestError.name !== "AbortError") {
                    setOptionsError("Couldn't load roles and skills. You can still create the project and add roles later.");
                }
            });

        return () => controller.abort();
    }, []);

    function updateRow(key, changes) {
        setRows((previous) => previous.map((row) => (row.key === key ? { ...row, ...changes } : row)));
    }

    function toggleSkill(row, skillId) {
        const skillIds = row.skillIds.includes(skillId)
            ? row.skillIds.filter((id) => id !== skillId)
            : [...row.skillIds, skillId];

        updateRow(row.key, { skillIds });
    }

    function validate() {
        if (!title.trim()) return "Give your project a title.";
        if (!description.trim()) return "Add a short description so developers know what you're building.";

        for (const row of rows) {
            if (!row.roleId) return "Choose a role for each role you added, or remove the empty one.";
            if (!Number.isInteger(row.count) || row.count < 1) return "Each role needs at least 1 developer.";
            if (row.skillIds.length === 0) return "Pick at least one skill for each role.";
        }

        return "";
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const problem = validate();

        if (problem) {
            setError(problem);
            return;
        }

        setError("");
        setIsSaving(true);

        let projectId = createdProjectId;

        try {
            if (!projectId) {
                const project = await createProject({
                    title: title.trim(),
                    description: description.trim(),
                    githubUrl: githubUrl.trim(),
                    websiteUrl: websiteUrl.trim(),
                });

                projectId = project.id;
                setCreatedProjectId(projectId);
            }
        } catch (requestError) {
            setError(requestError.message);
            setIsSaving(false);
            return;
        }

        for (const row of rows) {
            if (row.saved) continue;

            try {
                await addProjectRole(projectId, {
                    roleId: Number(row.roleId),
                    noOfDevelopers: row.count,
                    skillIds: row.skillIds,
                });

                updateRow(row.key, { saved: true });
            } catch (requestError) {
                setError(`Your project was created, but a role couldn't be added: ${requestError.message}`);
                setIsSaving(false);
                return;
            }
        }

        navigate(`/projects/${projectId}`);
    }

    const chosenRoleIds = rows.map((row) => row.roleId);
    const isLocked = createdProjectId !== null;

    return (
        <div className="create-project">
            <PageHeader title="New project" fallbackTo="/my-projects" />

            <form className="create-project-card" onSubmit={handleSubmit} noValidate>
                <label className="form-field">
                    <span className="form-label">Project title</span>
                    <input
                        className="form-input"
                        type="text"
                        maxLength={200}
                        value={title}
                        placeholder="e.g. Campus Connect"
                        disabled={isLocked}
                        onChange={(event) => setTitle(event.target.value)}
                        autoFocus
                    />
                </label>

                <label className="form-field">
                    <span className="form-label">Description</span>
                    <textarea
                        className="form-input form-textarea"
                        rows={5}
                        value={description}
                        placeholder="What are you building, and who is it for?"
                        disabled={isLocked}
                        onChange={(event) => setDescription(event.target.value)}
                    />
                </label>

                <div className="create-project-row">
                    <label className="form-field">
                        <span className="form-label">GitHub link (optional)</span>
                        <input
                            className="form-input"
                            type="url"
                            value={githubUrl}
                            placeholder="https://github.com/..."
                            disabled={isLocked}
                            onChange={(event) => setGithubUrl(event.target.value)}
                        />
                    </label>

                    <label className="form-field">
                        <span className="form-label">Website (optional)</span>
                        <input
                            className="form-input"
                            type="url"
                            value={websiteUrl}
                            placeholder="https://"
                            disabled={isLocked}
                            onChange={(event) => setWebsiteUrl(event.target.value)}
                        />
                    </label>
                </div>

                <div className="create-project-roles">
                    <div className="create-project-roles-header">
                        <h2 className="create-project-roles-title">Roles you need</h2>
                        <Button
                            size="sm"
                            disabled={isSaving || roles.length === 0 || skills.length === 0 || rows.length >= roles.length}
                            onClick={() => setRows((previous) => [...previous, newRoleRow()])}
                        >
                            + Add role
                        </Button>
                    </div>

                    {optionsError && <p className="form-error" role="alert">{optionsError}</p>}

                    {rows.length === 0 && !optionsError && (
                        <p className="create-project-hint">
                            Add the roles you want to fill. You can create the project without any and add them later.
                        </p>
                    )}

                    {rows.map((row) => (
                        <div key={row.key} className="create-project-role">
                            <div className="create-project-role-top">
                                <label className="form-field create-project-role-select">
                                    <span className="form-label">Role</span>
                                    <select
                                        className="form-input form-select"
                                        value={row.roleId}
                                        disabled={row.saved || isSaving}
                                        onChange={(event) => updateRow(row.key, { roleId: event.target.value })}
                                    >
                                        <option value="">Choose a role</option>
                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.id}
                                                disabled={chosenRoleIds.includes(String(role.id)) && String(role.id) !== String(row.roleId)}
                                            >
                                                {role.title}
                                            </option>
                                        ))}
                                    </select>
                                </label>

                                <label className="form-field create-project-role-count">
                                    <span className="form-label">Developers</span>
                                    <input
                                        className="form-input"
                                        type="number"
                                        min={1}
                                        max={50}
                                        value={row.count}
                                        disabled={row.saved || isSaving}
                                        onChange={(event) => updateRow(row.key, { count: parseInt(event.target.value, 10) || 0 })}
                                    />
                                </label>

                                {row.saved ? (
                                    <span className="create-project-role-saved">Added</span>
                                ) : (
                                    <button
                                        type="button"
                                        className="create-project-role-remove"
                                        disabled={isSaving}
                                        onClick={() => setRows((previous) => previous.filter((item) => item.key !== row.key))}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>

                            {skills.length > 0 && (
                                <div className="form-field">
                                    <span className="form-label">Skills</span>
                                    <div className="create-project-skills">
                                        {skills.map((skill) => (
                                            <button
                                                key={skill.id}
                                                type="button"
                                                className="create-project-skill"
                                                aria-pressed={row.skillIds.includes(skill.id)}
                                                disabled={row.saved || isSaving}
                                                onClick={() => toggleSkill(row, skill.id)}
                                            >
                                                {skill.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="create-project-actions">
                    {isLocked ? (
                        <Button onClick={() => navigate(`/projects/${createdProjectId}`)} disabled={isSaving}>
                            Go to project
                        </Button>
                    ) : (
                        <Button onClick={() => navigate("/my-projects")} disabled={isSaving}>
                            Cancel
                        </Button>
                    )}

                    <Button variant="primary" type="submit" disabled={isSaving}>
                        {isSaving ? "Creating..." : isLocked ? "Add remaining roles" : "Create project"}
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default CreateProject;
