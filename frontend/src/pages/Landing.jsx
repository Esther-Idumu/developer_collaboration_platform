import Navbar from "../components/Navbar/Navbar";
import './Landing.css';

function Landing () {
    return (
        <div>
            <Navbar />
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-text">
                        <p className="eyebrow">Build Together</p>
                        <h1>Find developers. Build projects. Grow together.</h1>
                        <p className="hero-description">Connect with developers, discover projects, and build meaningful skills together.</p>

                    <div className="hero-buttons">
                        <a href="" className="primary-button">Find a project</a>
                        <a href="" className="secondary-button">Find developers</a>
                    </div> 
                </div>

                <div className="hero-image">
                    <img src="/hero-section.jpg" alt="developers working together" />
                </div>

                </div>
            </section>

            <section className="how-it-works">
                <div className="section-heading">
                    <p>How It Works</p>
                    <h2>From idea to collaboration.</h2>
                    <p>Do you have an idea you can't execute on your own? </p>
                </div>

                <div className="steps">
                    <div className="step">
                        <span>01</span>
                        <h3>Discover</h3>
                        <p>Explore developers and projects that align with your skills and goals.</p>
                    </div>

                    <div className="step">
                        <span>02</span>
                        <h3>Connect</h3>
                        <p>Connect with developers who can bring your ideas to life.</p>
                    </div>

                    <div className="step">
                        <span>03</span>
                        <h3>Build</h3>
                        <p>Create meaningful projects and build new skills together.</p>
                    </div>

                </div>

            </section>

            <section className="featured-projects">
                <div className="featured-projects-header">
                    <h2>Featured Projects</h2>
                    <p>Explore projects looking for developers.</p>
                    <p>Find something interesting and join the team.</p>
                </div>
                <div className="project-cards">
                    <div className="card">
                        <h3>Lorem ipsum dolor sit amet.</h3>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci vero aliquam voluptatibus, magnam rem, nam, sit blanditiis.
                        </p>
                        <p>React Django</p>
                        <p>3 developers</p>
                        <a href="">View project</a>
                    </div>

                    <div className="card">
                        <h3>Lorem ipsum dolor sit amet.</h3>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci vero aliquam voluptatibus, magnam rem, nam, sit blanditiis.
                        </p>
                        <p>React Django</p>
                        2 developers
                        <a href="">View project</a>
                    </div>

                    <div className="card">
                        <h3>Lorem ipsum dolor sit amet.</h3>
                        <p>
                            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci vero aliquam voluptatibus, magnam rem, nam, sit blanditiis.
                        </p>
                        <p>React Django</p>
                        <p>4 developers</p>
                        <a href="">View project</a>
                    </div> 
                </div>
                
                <a href="">View all projects →</a>
            </section>
        </div>
    )
}

export default Landing;