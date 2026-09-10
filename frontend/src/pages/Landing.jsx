import Navbar from "../components/Navbar/Navbar";
import "./Landing.css";

function Landing() {
    return (
        <div>
            <Navbar />

            {/* Hero */}
            <section className="hero">
                <div className="hero-content">

                    <div className="hero-text">
                        <p className="eyebrow">BUILD TOGETHER</p>

                        <h1>
                            Find developers.
                            <br />
                            Build projects.
                            <br />
                            <span>Grow together.</span>
                        </h1>

                        <p className="hero-description">
                            Connect with developers, discover projects, and
                            build meaningful things together.
                        </p>

                        <div className="hero-buttons">
                            <a href="" className="primary-button">
                                Find a project
                            </a>

                            <a href="" className="secondary-button">
                                Find developers
                            </a>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="project-preview">
                            <div className="preview-header">
                                <span className="status-dot"></span>
                                <span>OPEN FOR COLLABORATION</span>
                            </div>

                            <h3>AI Study Assistant</h3>

                            <p>
                                An intelligent study platform that helps
                                students organize and improve their learning.
                            </p>

                            <div className="tech-stack">
                                <span>React</span>
                                <span>Django</span>
                                <span>PostgreSQL</span>
                            </div>

                            <div className="preview-footer">
                                <div className="avatars">
                                    <span>JD</span>
                                    <span>AM</span>
                                    <span>+2</span>
                                </div>

                                <span>2 roles open</span>
                            </div>
                        </div>

                        <div className="floating-card developer-card">
                            <span className="developer-avatar">ES</span>

                            <div>
                                <strong>Full Stack Developer</strong>
                                <small>Available for projects</small>
                            </div>
                        </div>

                        <div className="floating-card activity-card">
                            <span className="activity-icon">+</span>

                            <div>
                                <strong>New collaboration</strong>
                                <small>Backend Developer joined</small>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* How It Works */}
            <section className="how-it-works">
                <div className="section-heading">
                    <p className="eyebrow">HOW IT WORKS</p>

                    <h2>From idea to collaboration.</h2>

                    <p>
                        Find the right project, connect with the right people,
                        and start building together.
                    </p>
                </div>

                <div className="journey">

                    {/* Discover */}
                    <div className="journey-step">
                        <div className="step-number">01</div>

                        <div className="step-content">
                            <h3>Discover</h3>

                            <p>
                                Explore projects that match your skills,
                                interests, and goals.
                            </p>

                            <div className="journey-card project-search-card">
                                <div className="mini-header">
                                    <span>Projects</span>
                                    <span className="mini-filter">Filter</span>
                                </div>

                                <div className="mini-project">
                                    <div>
                                        <strong>Campus Connect</strong>
                                        <small>Looking for 2 developers</small>
                                    </div>

                                    <span>OPEN</span>
                                </div>

                                <div className="mini-project">
                                    <div>
                                        <strong>DevBoard</strong>
                                        <small>Looking for 1 developer</small>
                                    </div>

                                    <span>OPEN</span>
                                </div>

                                <div className="mini-project">
                                    <div>
                                        <strong>SkillSwap</strong>
                                        <small>Looking for 3 developers</small>
                                    </div>

                                    <span>OPEN</span>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Connector */}
                    <div className="journey-connector">
                        <span></span>
                    </div>


                    {/* Connect */}
                    <div className="journey-step">
                        <div className="step-number">02</div>

                        <div className="step-content">
                            <h3>Connect</h3>

                            <p>
                                Meet developers whose skills complement
                                your project.
                            </p>

                            <div className="journey-card developer-search-card">
                                <div className="mini-header">
                                    <span>Developer</span>
                                    <span className="available">AVAILABLE</span>
                                </div>

                                <div className="mini-profile">
                                    <div className="mini-avatar">AM</div>

                                    <div>
                                        <strong>Amaka M.</strong>
                                        <small>Frontend Developer</small>
                                    </div>
                                </div>

                                <div className="mini-skills">
                                    <span>React</span>
                                    <span>JavaScript</span>
                                    <span>UI/UX</span>
                                </div>

                                <div className="connect-action">
                                    <span>Great match for your project</span>
                                    <button>Connect</button>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Connector */}
                    <div className="journey-connector">
                        <span></span>
                    </div>


                    {/* Build */}
                    <div className="journey-step">
                        <div className="step-number">03</div>

                        <div className="step-content">
                            <h3>Build</h3>

                            <p>
                                Collaborate, contribute, and turn your idea
                                into something real.
                            </p>

                            <div className="journey-card build-card">
                                <div className="mini-header">
                                    <span>Campus Connect</span>
                                    <span>TEAM</span>
                                </div>

                                <div className="progress-info">
                                    <div>
                                        <strong>Project progress</strong>
                                        <small>6 of 8 tasks completed</small>
                                    </div>

                                    <strong>75%</strong>
                                </div>

                                <div className="progress-bar">
                                    <span></span>
                                </div>

                                <div className="team-row">
                                    <div className="mini-team">
                                        <span>JD</span>
                                        <span>AM</span>
                                        <span>TK</span>
                                    </div>

                                    <small>3 collaborators</small>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
            {/* Featured Projects */}
            <section className="featured-projects">
                <div className="featured-projects-header">
                    <div>
                        <p className="eyebrow">EXPLORE</p>
                        <h2>Featured Projects</h2>
                    </div>

                    <p>
                        Discover projects looking for developers like you.
                    </p>
                </div>

                <div className="project-cards">

                    <div className="card">
                        <span className="project-status">OPEN</span>

                        <h3>Campus Connect</h3>

                        <p>
                            A platform helping university students discover
                            communities, events, and opportunities on campus.
                        </p>

                        <div className="tech-stack">
                            <span>React</span>
                            <span>Django</span>
                            <span>PostgreSQL</span>
                        </div>

                        <div className="card-footer">
                            <span>2 developers needed</span>
                            <a href="">View project →</a>
                        </div>
                    </div>

                    <div className="card">
                        <span className="project-status">OPEN</span>

                        <h3>DevBoard</h3>

                        <p>
                            An open-source task management platform for
                            developers to organize and collaborate on projects.
                        </p>

                        <div className="tech-stack">
                            <span>React</span>
                            <span>FastAPI</span>
                            <span>PostgreSQL</span>
                        </div>

                        <div className="card-footer">
                            <span>1 developer needed</span>
                            <a href="">View project →</a>
                        </div>
                    </div>

                    <div className="card">
                        <span className="project-status">OPEN</span>

                        <h3>SkillSwap</h3>

                        <p>
                            A peer-to-peer learning platform where developers
                            exchange knowledge and build together.
                        </p>

                        <div className="tech-stack">
                            <span>React</span>
                            <span>Django</span>
                            <span>PostgreSQL</span>
                        </div>

                        <div className="card-footer">
                            <span>3 developers needed</span>
                            <a href="">View project →</a>
                        </div>
                    </div>

                </div>

                <a href="" className="view-all">
                    View all projects →
                </a>
            </section>

            {/* Developer Network */}
            <section className="developer-network">
                <div className="network-content">
                    <p className="eyebrow">THE COMMUNITY</p>

                    <h2>
                        Your next project needs
                        <span> the right people.</span>
                    </h2>

                    <p>
                        Find developers with the skills, experience, and
                        interests that complement your ideas.
                    </p>

                    <a href="" className="primary-button">
                        Meet developers
                    </a>
                </div>

                <div className="developer-cards">

                    <div className="developer-profile profile-one">
                        <span className="profile-avatar">JD</span>
                        <strong>John Doe</strong>
                        <small>Backend Developer</small>
                        <div className="profile-skills">
                            <span>Django</span>
                            <span>Python</span>
                        </div>
                    </div>

                    <div className="developer-profile profile-two">
                        <span className="profile-avatar">AM</span>
                        <strong>Amaka M.</strong>
                        <small>Frontend Developer</small>
                        <div className="profile-skills">
                            <span>React</span>
                            <span>JavaScript</span>
                        </div>
                    </div>

                    <div className="developer-profile profile-three">
                        <span className="profile-avatar">TK</span>
                        <strong>Tobi K.</strong>
                        <small>Full Stack Developer</small>
                        <div className="profile-skills">
                            <span>React</span>
                            <span>Node.js</span>
                        </div>
                    </div>

                </div>
            </section>

            {/* Final CTA */}
            <section className="final-cta">
                <p className="eyebrow">READY TO BUILD?</p>

                <h2>Your next project starts with a team.</h2>

                <p>
                    Find developers. Start collaborating. Build something
                    meaningful.
                </p>

                <div className="hero-buttons">
                    <a href="" className="primary-button">
                        Get started
                    </a>

                    <a href="" className="secondary-button">
                        Explore projects
                    </a>
                </div>
            </section>

        </div>
    );
}

export default Landing;