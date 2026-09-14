import "./Login.css";

function Login() {
    return (
        <main className="login-page">

            {/* Left side - Login form */}
            <section className="login-form-section">

                <div className="login-form-container">

                    <a href="/" className="login-brand">
                        <span>Dev</span>Link
                    </a>

                    <div className="login-heading">
                        <p className="eyebrow">WELCOME BACK</p>

                        <h1>Log in to DevLink.</h1>

                    </div>

                    <form className="login-form">

                        <div className="form-group">
                            <label htmlFor="email">Email</label>

                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <div className="password-label">
                                <label htmlFor="password">Password</label>

                                <a href="/forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                            <input
                                type="password"
                                id="password"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button type="submit" className="login-button">
                            Log in
                        </button>

                    </form>

                    <p className="signup-prompt">
                        Don't have an account?
                        <a href="/signup"> Sign up</a>
                    </p>

                </div>

            </section>


            {/* Right side - DevLink visual */}
            <section className="login-visual">

                <div className="visual-content">

                    <h2>
                        Great projects
                        <span> start with great people.</span>
                    </h2>

                <div className="login-project-preview">

                    <div className="preview-header">
                        <span className="status-dot"></span>
                        <span>OPEN FOR COLLABORATION</span>
                    </div>

                    <h3>AI Study Assistant</h3>

                    <p>
                        An intelligent study platform that helps students
                        organize and improve their learning.
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

                    <div className="visual-card developer-mini-card">

                        <div className="mini-avatar">AM</div>

                        <div>
                            <strong>Frontend Developer</strong>
                            <small>Ready to collaborate</small>
                        </div>

                        <span className="online-dot"></span>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Login;