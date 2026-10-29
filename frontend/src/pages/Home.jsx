import "./Home.css";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/Topbar/Topbar";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import AvatarStack from "../components/ui/AvatarStack/AvatarStack";
import OwnershipBadge from "../components/ui/OwnershipBadge/OwnershipBadge";
import ApplicationBadge from "../components/ui/ApplicationBadge/ApplicationBadge";

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

function Home() {
    return (
        <div className="home-page">
            <Sidebar />

            <div className="main-area">
                <Topbar />

                <main className="home-content">
                    <div className="featured-grid">
                        {projects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>

                    <OwnershipBadge role="owner"/>
                    <ApplicationBadge count="1" />

                </main>
            </div>
        </div>
    );
}

export default Home;