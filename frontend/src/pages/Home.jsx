import SectionCard from "../components/SectionCard/SectionCard";
import ProjectRow from "../components/ProjectRow/ProjectRow";
import ProjectCard from "../components/ProjectCard/ProjectCard";
import DeveloperCard from "../components/DeveloperCard/DeveloperCard";
import Button from "../components/ui/Button/Button";
import { useFetch } from "../hooks/useFetch";
import { getMyProjects, getOpenProjects, getSuggestedDevelopers } from "../api/endpoints";
import "./Home.css";

const MY_PROJECTS_LIMIT = 5;
const FEATURED_LIMIT = 6;

function Message({ children, error = false }) {
    return (
        <p className={`section-message ${error ? "section-message-error" : ""}`}>
            {children}
        </p>
    );
}

function Home() {
    const myProjects = useFetch(getMyProjects);
    const openProjects = useFetch(getOpenProjects);
    const developers = useFetch(getSuggestedDevelopers);

    // Featured = open projects the user is not already part of.
    const myProjectIds = new Set((myProjects.data ?? []).map((project) => project.id));
    const featured = (openProjects.data ?? [])
        .filter((project) => !myProjectIds.has(project.id))
        .slice(0, FEATURED_LIMIT);
    const featuredLoading = openProjects.isLoading || myProjects.isLoading;

    return (
        <div className="home">

            <SectionCard title="My Projects" linkTo="/my-projects" linkLabel="See all">
                {myProjects.isLoading && <Message>Loading your projects...</Message>}

                {myProjects.error && (
                    <Message error>We couldn't load your projects. {myProjects.error.message}</Message>
                )}

                {myProjects.data && myProjects.data.length === 0 && (
                    <div className="empty-state">
                        <p className="empty-state-title">You're not part of any projects yet</p>
                        <p className="empty-state-text">
                            Start your own project or find one that needs your skills.
                        </p>
                        <div className="empty-state-actions">
                            <Button variant="primary" to="/projects/new">Create a project</Button>
                        </div>
                    </div>
                )}

                {myProjects.data && myProjects.data.length > 0 && (
                    <div className="my-projects-list">
                        {myProjects.data.slice(0, MY_PROJECTS_LIMIT).map((project) => (
                            <ProjectRow key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </SectionCard>

            <SectionCard title="Featured Projects">
                {featuredLoading && <Message>Loading projects...</Message>}

                {openProjects.error && (
                    <Message error>We couldn't load projects. {openProjects.error.message}</Message>
                )}

                {!featuredLoading && !openProjects.error && featured.length === 0 && (
                    <Message>There are no open projects right now. Check back soon.</Message>
                )}

                {!featuredLoading && featured.length > 0 && (
                    <div className="featured-grid">
                        {featured.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Hidden when there is nobody to suggest yet */}
            {(developers.isLoading || developers.error || developers.data.length > 0) && (
                <SectionCard title="Developers you may work with" linkTo="/developers" linkLabel="View all">
                    {developers.isLoading && <Message>Loading developers...</Message>}

                    {developers.error && (
                        <Message error>We couldn't load developers. {developers.error.message}</Message>
                    )}

                    {developers.data && developers.data.length > 0 && (
                        <div className="developer-grid">
                            {developers.data.map((developer) => (
                                <DeveloperCard key={developer.id} developer={developer} />
                            ))}
                        </div>
                    )}
                </SectionCard>
            )}

        </div>
    );
}

export default Home;
