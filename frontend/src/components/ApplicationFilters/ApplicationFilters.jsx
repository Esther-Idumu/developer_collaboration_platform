import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button/Button";
import "./ApplicationFilters.css";

const STATUS_OPTIONS = [
    { id: "pending", label: "Pending" },
    { id: "accepted", label: "Accepted" },
    { id: "rejected", label: "Declined" },
    { id: "withdrawn", label: "Withdrawn" },
];

function ApplicationFilters({ statuses, projectId, projects, onToggleStatus, onProjectChange, onClear }) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        function handlePointerDown(event) {
            if (rootRef.current && !rootRef.current.contains(event.target)) {
                setOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [open]);

    const activeCount = statuses.length + (projectId ? 1 : 0);

    return (
        <div className="application-filters" ref={rootRef}>
            <Button
                variant={open || activeCount > 0 ? "primary" : "secondary"}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((isOpen) => !isOpen)}
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M7 12h10" />
                        <path d="M10 18h4" />
                    </svg>
                }
            >
                Filters{activeCount > 0 ? ` (${activeCount})` : ""}
            </Button>

            {open && (
                <div className="application-filters-panel">
                    <p className="application-filters-heading">Status</p>

                    {STATUS_OPTIONS.map((option) => (
                        <label key={option.id} className="application-filters-option">
                            <input
                                type="checkbox"
                                checked={statuses.includes(option.id)}
                                onChange={() => onToggleStatus(option.id)}
                            />
                            <span className={`application-filters-dot application-filters-dot-${option.id}`} aria-hidden="true" />
                            {option.label}
                        </label>
                    ))}

                    <div className="application-filters-divider" />

                    <label className="application-filters-heading" htmlFor="application-filters-project">
                        Project
                    </label>

                    <select
                        id="application-filters-project"
                        className="application-filters-select"
                        value={projectId}
                        onChange={(event) => onProjectChange(event.target.value)}
                    >
                        <option value="">All projects</option>
                        {projects.map((project) => (
                            <option key={project.id} value={String(project.id)}>
                                {project.title}
                            </option>
                        ))}
                    </select>

                    <div className="application-filters-footer">
                        <button type="button" className="application-filters-clear" onClick={onClear}>
                            Clear all
                        </button>

                        <Button variant="primary" size="sm" onClick={() => setOpen(false)}>
                            Done
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ApplicationFilters;
