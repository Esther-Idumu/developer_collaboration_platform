import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Signup.css";

function Signup() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [errors, setErrors] = useState({});
    const [formError, setFormError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        setErrors({});
        setFormError("");

        if (password !== confirmPassword) {
            setErrors({
                confirmPassword: "Passwords do not match.",
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/register/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                    }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                navigate("/login");
                return;
            }

            if (data.email || data.password) {
                setErrors({
                    email: data.email?.[0],
                    password: data.password?.[0],
                });
            } else {
                setFormError(
                    "We couldn't create your account. Please check your details and try again."
                );
            }

        } catch (error) {
            console.error(error);

            setFormError(
                "Unable to connect to the server. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="signup-page">

            {/* left side - Signup form */}
            <section className="signup-form-section">

                <div className="signup-form-container">

                    <a href="/" className="signup-brand">
                        <span>Dev</span>Link
                    </a>

                    <div className="signup-heading">

                        <p className="eyebrow">GET STARTED</p>

                        <h1>Create your DevLink account.</h1>

                    </div>

                    <form
                        className="signup-form"
                        onSubmit={handleSubmit}
                    >

                        {/* Email */}
                        <div className="form-group">

                            <label htmlFor="email">
                                Email
                            </label>

                            <input
                                type="email"
                                id="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);

                                    if (errors.email) {
                                        setErrors({
                                            ...errors,
                                            email: undefined,
                                        });
                                    }
                                }}
                                className={errors.email ? "input-error" : ""}
                                required
                            />

                            {errors.email && (
                                <p className="field-error">
                                    {errors.email}
                                </p>
                            )}

                        </div>

                        {/* Password */}
                        <div className="form-group">

                            <label htmlFor="password">
                                Password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Create a password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);

                                        if (errors.password) {
                                            setErrors({
                                                ...errors,
                                                password: undefined,
                                            });
                                        }
                                    }}
                                    className={errors.password ? "input-error" : ""}
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>

                            </div>

                            {errors.password && (
                                <p className="field-error">
                                    {errors.password}
                                </p>
                            )}

                        </div>

                        {/* Confirm password */}
                        <div className="form-group">

                            <label htmlFor="confirm-password">
                                Confirm password
                            </label>

                            <div className="password-input-wrapper">

                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    id="confirm-password"
                                    placeholder="Confirm your password"
                                    value={confirmPassword}
                                    onChange={(event) => {
                                        setConfirmPassword(event.target.value);

                                        if (errors.confirmPassword) {
                                            setErrors({
                                                ...errors,
                                                confirmPassword: undefined,
                                            });
                                        }
                                    }}
                                    className={
                                        errors.confirmPassword
                                            ? "input-error"
                                            : ""
                                    }
                                    required
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    aria-label={
                                        showConfirmPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </button>

                            </div>

                            {errors.confirmPassword && (
                                <p className="field-error">
                                    {errors.confirmPassword}
                                </p>
                            )}

                        </div>

                        {/* General form error */}
                        {formError && (
                            <p className="form-error">
                                {formError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="signup-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Creating account..."
                                : "Create account"}
                        </button>

                    </form>

                    <p className="login-prompt">
                        Already have an account?
                        <a href="/login"> Log in</a>
                    </p>

                </div>

            </section>

            {/* right side - DevLink visual */}
            <section className="signup-visual">

                <div className="visual-content">

                    <h2>
                        Find the right people
                        <span> for your next project.</span>
                    </h2>

                    <div className="signup-project-preview">

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

export default Signup;