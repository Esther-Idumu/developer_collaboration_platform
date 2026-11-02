import { useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import ProjectRow from "../components/ProjectRow/ProjectRow";
import DeveloperCard from "../components/DeveloperCard/DeveloperCard";
import Tabs from "../components/Tab/Tabs";
import SearchInput from "../components/SearchInput/SearchInput";
import Button from "../components/ui/Button/Button";


const people = [
    { id: 1, name: "Kofi Mensah" },
    { id: 2, name: "Amara Okafor" },
    { id: 3, name: "Daniel Mensah" },
    { id: 4, name: "Sofia Reyes" },
];

const myProjects = [
    { id: 1, title: "Campus Connect", role: "owner", status: "open", members: people.slice(0, 3), capacity: 5, newApplications: 4 },
    { id: 2, title: "EchoNotes", role: "member", status: "in_progress", members: people.slice(0, 2), capacity: 4, newApplications: 0 },
    { id: 3, title: "OpenLedger", role: "owner", status: "in_progress", members: people, capacity: 4, newApplications: 0 },
    { id: 4, title: "ClinicQueue", role: "owner", status: "open", members: people.slice(0, 2), capacity: 5, newApplications: 1 },
];

const projects = [
    {
        id: 1,
        title: "Campus Connect",
        description:
            "An online platform helping university students discover events, communities and opportunities on campus.",
        status: "open",
        skills: ["React", "Django", "PostgreSQL"],
        members: [
                    { id: 1, name: "Kofi Mensah" },
                    { id: 2, name: "Amara Okafor" },
                    { id: 3, name: "Daniel Mensah" },
                ],
        capacity: 5,
    },
    {
        id: 2,
        title: "OpenLedger",
        description:
            "Open-source personal finance tracker with shared budgets, clear monthly reports and CSV import.",
        status: "open",
        skills: ["Next.js", "FastAPI", "Redis"],
        members: [
                { id: 1, name: "Kofi Mensah" },
                { id: 2, name: "Daniel Mensah" },
            ],
        capacity: 4,
    },
    {
        id: 3,
        title: "TrailNotes",
        description:
            "A mobile-first app for hikers to log routes, share trail conditions and plan group trips together.",
        status: "in_progress",
        skills: ["React Native", "Node.js", "MongoDB"],
        members: [
                { id: 1, name: "Kofi Mensah" },
                { id: 2, name: "Amara Okafor" },
                { id: 3, name: "Daniel Mensah" },
                { id: 4, name: "Grace Sufiah"},
            ],
        capacity: 6,
    },
    {
        id: 4,
        title: "ClinicQueue",
        description:
            "Appointment and queue management for small clinics that still run their schedules on paper.",
        status: "open",
        skills: ["Vue", "Laravel", "MySQL"],
        members: [
            { id: 1, name: "Kofi Mensah" },
            { id: 2, name: "Amara Okafor" },
        ],
        capacity: 5,
    },
];

const team = [
    { id: 1, name: "Kofi Mensah" },
    { id: 2, name: "Amara Okafor" },
    { id: 3, name: "Daniel Mensah" },
];

const developer = {
    id: 1,
    name: "Amara Okafor",
    role: "Backend Engineer",
    skills: ["Python", "FastAPI", "PostgreSQL"],
    github: "https://github.com/amara-okafor",
    portfolio: "https://amara.dev",
};

const projectTabs = [
    { id: "all", label: "All" },
    { id: "owned", label: "Owned"},
    { id: "joined", label: "Joined"},
    { id: "saved", label: "Saved"},
];

function Home() {
    const [savedIds, setSavedIds] = useState([]);
    const [activeTab, setActiveTab] = useState("owned");
    const [query, setQuery] = useState("");

    function toggleSave(id) {
        setSavedIds((prev) =>
            prev.includes(id) ? prev.filter((savedId) => savedId !== id) : [...prev, id]
        );
    }

    return (
        <div className="home-page">
            <Sidebar />

            <div className="main-area">
                <Topbar />

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <SearchInput value={query} onChange={setQuery} placeholder="Search your projects..." />
                    <Button
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18" />
                                <path d="M7 12h10" />
                                <path d="M10 18h4" />
                            </svg>
                        }
                    >
                        Filters
                    </Button>
                    <Button
                        variant="primary"
                        to="/projects/new"
                        icon={
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                        }
                    >
                        New project
                    </Button>
                </div>

                <main className="home-content">
                    <Tabs tabs={projectTabs} activeTab={activeTab} onChange={setActiveTab} />

                    <div>
                        {myProjects.map((project) => (
                            <ProjectRow key={project.id} project={project} />
                        ))}
                    </div>
                    <div className="featured-grid">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                project={{ ...project, isSaved: savedIds.includes(project.id) }}
                                onToggleSave={toggleSave}
                            />
                        ))}
                    </div>

                    <DeveloperCard developer={developer} />

                </main>
            </div>
        </div>
    );
}

export default Home;