import { useEffect, useMemo, useRef, useState } from "react";
import Tabs from "../components/Tab/Tabs";
import SearchInput from "../components/SearchInput/SearchInput";
import MyProjectCard from "../components/MyProjectCard/MyProjectCard";
import Button from "../components/ui/Button/Button";
import { useFetch } from "../hooks/useFetch";
import { getMyProjects, getSavedProjects, unsaveProject } from "../api/endpoints";
import "./MyProjects.css";

const TABS = [
    { id: "all", label: "All" },
    { id: "owned", label: "Owned" },
    { id: "joined", label: "Joined" },
    { id: "saved", label: "Saved" },
];

const STATUS_OPTIONS = [
    { id: "all", label: "Any status" },
    { id: "open", label: "Open" },
    { id: "in_progress", label: "In progress" },
    { id: "complete", label: "Complete" },
];

const EMPTY_MESSAGES = {
    all: "You don't have any projects yet.",
    owned: "You haven't created any projects yet.",
    joined: "You haven't joined any projects yet.",
    saved: "You haven't saved any projects.",
};

// Defined outside the component so useFetch gets a stable function.
async function loadProjects(signal) {
    const [mine, saved] = await Promise.all([getMyProjects(signal), getSavedProjects(signal)]);
    return { mine, saved };
}

function matchesSearch(project, query) {
    const text = [project.title, project.description, ...(project.skills ?? [])].join(" ").toLowerCase();

    return text.includes(query);
}

function MyProjects() {
    const { data, error, isLoading } = useFetch(loadProjects);

    const [activeTab, setActiveTab] = useState("all");
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("all");
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [unsavedIds, setUnsavedIds] = useState(() => new Set());
    const [pendingIds, setPendingIds] = useState(() => new Set());
    const [actionError, setActionError] = useState("");
    const filtersRef = useRef(null);

    useEffect(() => {
        if (!filtersOpen) {
            return;
        }

        function handlePointerDown(event) {
            if (filtersRef.current && !filtersRef.current.contains(event.target)) {
                setFiltersOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setFiltersOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [filtersOpen]);

    const { projects, savedIds } = useMemo(() => {
        if (!data) {
            return { projects: [], savedIds: new Set() };
        }

        const savedIds = new Set(
            data.saved.filter((project) => !unsavedIds.has(project.id)).map((project) => project.id)
        );

        const byId = new Map();

        data.mine.forEach((project) => byId.set(project.id, project));
        data.saved.forEach((project) => {
            if (savedIds.has(project.id) && !byId.has(project.id)) {
                byId.set(project.id, project);
            }
        });

        const projects = [...byId.values()].sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        return { projects, savedIds };
    }, [data, unsavedIds]);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();

        return projects.filter((project) => {
            if (activeTab === "owned" && project.role !== "owner") return false;
            if (activeTab === "joined" && project.role !== "member") return false;
            if (activeTab === "saved" && !savedIds.has(project.id)) return false;
            if (status !== "all" && project.status !== status) return false;
            if (query && !matchesSearch(project, query)) return false;

            return true;
        });
    }, [projects, savedIds, activeTab, status, search]);

    async function handleUnsave(projectId) {
        if (pendingIds.has(projectId)) {
            return;
        }

        setActionError("");
        setPendingIds((previous) => new Set(previous).add(projectId));

        try {
            await unsaveProject(projectId);
            setUnsavedIds((previous) => new Set(previous).add(projectId));
        } catch (requestError) {
            // 404 means it was already unsaved somewhere else, so it should leave the page anyway.
            if (requestError.status === 404) {
                setUnsavedIds((previous) => new Set(previous).add(projectId));
            } else {
                setActionError(requestError.message);
            }
        } finally {
            setPendingIds((previous) => {
                const next = new Set(previous);
                next.delete(projectId);
                return next;
            });
        }
    }

    const isFiltering = search.trim() !== "" || status !== "all";

    return (
        <div className="my-projects-page">
            <div className="my-projects-toolbar">
                <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />

                <div className="my-projects-toolbar-actions">
                    <div className="my-projects-search">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search your projects..."
                            label="Search your projects"
                        />
                    </div>

                    <div className="my-projects-filters" ref={filtersRef}>
                        <Button
                            aria-haspopup="true"
                            aria-expanded={filtersOpen}
                            onClick={() => setFiltersOpen((open) => !open)}
                            icon={
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 6h18" />
                                    <path d="M7 12h10" />
                                    <path d="M10 18h4" />
                                </svg>
                            }
                        >
                            Filters{status !== "all" ? " (1)" : ""}
                        </Button>

                        {filtersOpen && (
                            <div className="my-projects-filters-panel">
                                <p className="my-projects-filters-title">Status</p>

                                {STATUS_OPTIONS.map((option) => (
                                    <label key={option.id} className="my-projects-filters-option">
                                        <input
                                            type="radio"
                                            name="status"
                                            checked={status === option.id}
                                            onChange={() => setStatus(option.id)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        variant="primary"
                        to="/projects/new"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        }
                    >
                        New project
                    </Button>
                </div>
            </div>

            <section className="my-projects-panel" aria-label="Projects">
                {actionError && <p className="my-projects-message my-projects-message-error" role="alert">{actionError}</p>}

                {isLoading && <p className="my-projects-message">Loading your projects...</p>}

                {error && (
                    <p className="my-projects-message my-projects-message-error">
                        We couldn't load your projects. {error.message}
                    </p>
                )}

                {data && visible.length === 0 && (
                    <p className="my-projects-message">
                        {isFiltering ? "No projects match your search or filters." : EMPTY_MESSAGES[activeTab]}
                    </p>
                )}

                {visible.length > 0 && (
                    <div className="my-projects-grid">
                        {visible.map((project) => (
                            <MyProjectCard
                                key={project.id}
                                project={project}
                                onUnsave={activeTab === "saved" ? handleUnsave : undefined}
                                isUnsaving={pendingIds.has(project.id)}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default MyProjects;
