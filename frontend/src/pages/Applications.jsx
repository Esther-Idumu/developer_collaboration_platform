import { useMemo, useState } from "react";
import Tabs from "../components/Tab/Tabs";
import SearchInput from "../components/SearchInput/SearchInput";
import ApplicationRow from "../components/ApplicationRow/ApplicationRow";
import ApplicationFilters from "../components/ApplicationFilters/ApplicationFilters";
import ApplicationModal from "../components/ApplicationModal/ApplicationModal";
import { useFetch } from "../hooks/useFetch";
import {
    getReceivedApplications,
    getSentApplications,
    markApplicationViewed,
    decideApplication,
    withdrawApplication,
} from "../api/endpoints";
import "./Applications.css";

const TABS = [
    { id: "received", label: "Received" },
    { id: "sent", label: "Sent" },
];

const EMPTY_MESSAGES = {
    received: "You haven't received any applications yet.",
    sent: "You haven't applied to any projects yet.",
};

// Defined outside the component so useFetch gets a stable function.
async function loadApplications(signal) {
    const [received, sent] = await Promise.all([
        getReceivedApplications(signal),
        getSentApplications(signal),
    ]);

    return { received, sent };
}

function matchesSearch(application, perspective, query) {
    const person = perspective === "received" ? application.applicant : application.owner;
    const text = [person.name, application.project.title, application.role].join(" ").toLowerCase();

    return text.includes(query);
}

function Applications() {
    const { data, error, isLoading } = useFetch(loadApplications);

    const [activeTab, setActiveTab] = useState("received");
    const [search, setSearch] = useState("");
    const [statuses, setStatuses] = useState([]);
    const [projectId, setProjectId] = useState("");
    const [newestFirst, setNewestFirst] = useState(true);

    // Latest version of any application changed on this page (viewed, accepted, withdrawn...), by id.
    const [updates, setUpdates] = useState({});
    const [selected, setSelected] = useState(null); // { id, perspective }
    const [isBusy, setIsBusy] = useState(false);
    const [actionError, setActionError] = useState("");

    const applications = useMemo(() => {
        if (!data) {
            return [];
        }

        return data[activeTab].map((application) => updates[application.id] ?? application);
    }, [data, activeTab, updates]);

    const projectOptions = useMemo(() => {
        const byId = new Map();

        applications.forEach((application) => byId.set(application.project.id, application.project));

        return [...byId.values()].sort((a, b) => a.title.localeCompare(b.title));
    }, [applications]);

    const visible = useMemo(() => {
        const query = search.trim().toLowerCase();

        return applications
            .filter((application) => {
                if (statuses.length > 0 && !statuses.includes(application.status)) return false;
                if (projectId && String(application.project.id) !== projectId) return false;
                if (query && !matchesSearch(application, activeTab, query)) return false;

                return true;
            })
            .sort((a, b) => {
                const difference = new Date(b.createdAt) - new Date(a.createdAt);

                return newestFirst ? difference : -difference;
            });
    }, [applications, statuses, projectId, search, activeTab, newestFirst]);

    const selectedApplication = useMemo(() => {
        if (!selected || !data) {
            return null;
        }

        const original = data[selected.perspective].find((application) => application.id === selected.id);

        return original ? (updates[original.id] ?? original) : null;
    }, [selected, data, updates]);

    function handleTabChange(tabId) {
        setActiveTab(tabId);
        setProjectId("");
    }

    function toggleStatus(statusId) {
        setStatuses((current) =>
            current.includes(statusId) ? current.filter((id) => id !== statusId) : [...current, statusId]
        );
    }

    function clearFilters() {
        setStatuses([]);
        setProjectId("");
    }

    function handleOpen(application) {
        setActionError("");
        setSelected({ id: application.id, perspective: activeTab });

        // The owner opening an application the first time marks it as viewed.
        if (activeTab === "received" && !application.viewedAt) {
            markApplicationViewed(application.id)
                .then((updated) => setUpdates((current) => ({ ...current, [updated.id]: updated })))
                .catch(() => {});
        }
    }

    function handleClose() {
        if (!isBusy) {
            setSelected(null);
            setActionError("");
        }
    }

    // Runs accept / decline / withdraw, then shows the new status in the list and closes the modal.
    async function runAction(request) {
        const target = selectedApplication;

        setIsBusy(true);
        setActionError("");

        try {
            const result = await request(target.id);

            setUpdates((current) => ({
                ...current,
                [target.id]: {
                    ...(current[target.id] ?? target),
                    status: result.application.status,
                    updatedAt: result.application.updated_at,
                },
            }));
            setSelected(null);
        } catch (requestError) {
            setActionError(requestError.message);
        } finally {
            setIsBusy(false);
        }
    }

    const isFiltering = search.trim() !== "" || statuses.length > 0 || projectId !== "";

    return (
        <div className="applications-page">
            <div className="applications-toolbar">
                <Tabs tabs={TABS} activeTab={activeTab} onChange={handleTabChange} />

                <div className="applications-toolbar-actions">
                    <div className="applications-search">
                        <SearchInput
                            value={search}
                            onChange={setSearch}
                            placeholder="Search by name, project or role..."
                            label="Search applications"
                        />
                    </div>

                    <ApplicationFilters
                        statuses={statuses}
                        projectId={projectId}
                        projects={projectOptions}
                        onToggleStatus={toggleStatus}
                        onProjectChange={setProjectId}
                        onClear={clearFilters}
                    />

                    <button
                        type="button"
                        className="applications-sort"
                        onClick={() => setNewestFirst((current) => !current)}
                    >
                        Sort by: <strong>{newestFirst ? "Newest" : "Oldest"}</strong>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m21 16-4 4-4-4" />
                            <path d="M17 20V4" />
                            <path d="m3 8 4-4 4 4" />
                            <path d="M7 4v16" />
                        </svg>
                    </button>
                </div>
            </div>

            <section className="applications-panel" aria-label="Applications">
                {isLoading && <p className="applications-message">Loading applications...</p>}

                {error && (
                    <p className="applications-message applications-message-error">
                        We couldn't load your applications. {error.message}
                    </p>
                )}

                {data && visible.length === 0 && (
                    <p className="applications-message">
                        {isFiltering ? "No applications match your search or filters." : EMPTY_MESSAGES[activeTab]}
                    </p>
                )}

                {visible.map((application) => (
                    <ApplicationRow
                        key={application.id}
                        application={application}
                        perspective={activeTab}
                        onOpen={handleOpen}
                    />
                ))}
            </section>

            {selectedApplication && (
                <ApplicationModal
                    key={selectedApplication.id}
                    application={selectedApplication}
                    perspective={selected.perspective}
                    isBusy={isBusy}
                    error={actionError}
                    onClose={handleClose}
                    onAccept={() => runAction((id) => decideApplication(id, "accepted"))}
                    onDecline={() => runAction((id) => decideApplication(id, "rejected"))}
                    onWithdraw={() => runAction((id) => withdrawApplication(id))}
                />
            )}
        </div>
    );
}

export default Applications;
