import { useState } from "react";
import "./Home.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import ProjectRow from "../components/ProjectRow/ProjectRow";
import DeveloperCard from "../components/DeveloperCard/DeveloperCard";

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

function Home() {
    const [savedIds, setSavedIds] = useState([]);

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

                <main className="home-content">
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