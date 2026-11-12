
import { useState } from "react";
import { API_URL } from "../api/client";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [emailVerificationRequired, setEmailVerificationRequired] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [resendMessage, setResendMessage] = useState("");
    const [resendError, setResendError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setResendMessage("");
        setResendError("");
        setEmailVerificationRequired(false);
        setIsSubmitting(true);

        try {
            const response = await fetch(
                `${API_URL}/accounts/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                // Handle unverified email separately.
                const errorCode = Array.isArray(data.code)
                    ? data.code[0]
                    : data.code;

                if (errorCode === "email_not_verified") {
                    setEmailVerificationRequired(true);
                    setError(
                        "Your email address has not been verified yet."
                    );
                } else if (data.non_field_errors) {
                    setError(data.non_field_errors[0]);
                } else if (data.detail) {
                    setError(data.detail);
                } else if (data.email) {
                    setError(data.email[0]);
                } else if (data.password) {
                    setError(data.password[0]);
                } else {
                    setError(
                        data.message?.[0] ||
                        "Invalid email or password."
                    );
                }

                return;
            }

            const accessToken = data.access;
            const refreshToken = data.refresh;

            const userResponse = await fetch(
                `${API_URL}/accounts/me`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!userResponse.ok) {
                throw new Error("Could not retrieve user information.");
            }

            const userData = await userResponse.json();

            login(accessToken, refreshToken, userData);

            navigate("/home");

        } catch (error) {
            console.error("Login error:", error);

            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {
            setIsSubmitting(false);
        }
    }

    async function handleResendVerification() {
        if (!email.trim()) {
            setResendError("Please enter your email address.");
            return;
        }

        setIsResending(true);
        setResendMessage("");
        setResendError("");

        try {
            const response = await fetch(
                `${API_URL}/accounts/resend-verification`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.email?.[0] ||
                    data.detail ||
                    "Unable to process your request. Please try again."
                );
            }

            setResendMessage(
                data.message ||
                "If an unverified account exists with this email, a verification link will be sent."
            );

        } catch (error) {
            console.error("Resend verification error:", error);

            setResendError(
                error.message ||
                "Unable to resend verification email. Please try again."
            );

        } finally {
            setIsResending(false);
        }
    }

    return (
        <main className="login-page">

            {/* Left side - Login form */}
            <section className="login-form-section">

                <div className="login-form-container">

                    <a href="/" className="login-brand">
                        <span>Dev</span>Link
                    </a>

                    <div className="login-heading">
                        <p className="eyebrow">
                            WELCOME BACK
                        </p>

                        <h1>
                            Log in to DevLink.
                        </h1>
                    </div>

                    <form
                        className="login-form"
                        onSubmit={handleSubmit}
                    >

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
                                    setError("");
                                    setEmailVerificationRequired(false);
                                    setResendMessage("");
                                    setResendError("");
                                }}
                                required
                            />
                        </div>

                        <div className="form-group">

                            <div className="password-label">
                                <label htmlFor="password">
                                    Password
                                </label>

                                <a href="/forgot-password">
                                    Forgot password?
                                </a>
                            </div>

                            <div className="password-input-wrapper">

                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(event) => {
                                        setPassword(event.target.value);
                                        setError("");
                                        setEmailVerificationRequired(false);
                                        setResendMessage("");
                                        setResendError("");
                                    }}
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
                        </div>

                        {error && (
                            <p className="form-error" role="alert">
                                {error}
                            </p>
                        )}

                        {/* Email verification recovery */}
                        {emailVerificationRequired && (
                            <div className="verification-notice">

                                <div className="verification-notice-header">
                                    <strong>
                                        Email verification required
                                    </strong>
                                </div>

                                <p>
                                    You haven't verified your email address.
                                    Request a new verification link to activate
                                    your account.
                                </p>

                                {resendMessage && (
                                    <p
                                        className="verification-success"
                                        role="status"
                                    >
                                        {resendMessage}
                                    </p>
                                )}

                                {resendError && (
                                    <p
                                        className="verification-error"
                                        role="alert"
                                    >
                                        {resendError}
                                    </p>
                                )}

                                <button
                                    type="button"
                                    className="resend-verification-button"
                                    onClick={handleResendVerification}
                                    disabled={isResending || !email.trim()}
                                >
                                    {isResending
                                        ? "Sending..."
                                        : "Resend verification email"}
                                </button>

                            </div>
                        )}

                        <button
                            type="submit"
                            className="login-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Logging in..."
                                : "Log in"}
                        </button>

                    </form>

                    <p className="signup-prompt">
                        Don't have an account?
                        <a href="/signup">
                            {" "}Sign up
                        </a>
                    </p>

                </div>
            </section>

            {/* Right side - DevLink visual */}
            <section className="login-visual">

                <div className="visual-content">

                    <h2>
                        Great projects
                        <span>
                            {" "}start with great people.
                        </span>
                    </h2>

                    <div className="login-project-preview">

                        <div className="preview-header">
                            <span className="status-dot"></span>
                            <span>
                                OPEN FOR COLLABORATION
                            </span>
                        </div>

                        <h3>
                            AI Study Assistant
                        </h3>

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

                            <span>
                                2 roles open
                            </span>

                        </div>
                    </div>

                    <div className="visual-card developer-mini-card">

                        <div className="mini-avatar">
                            AM
                        </div>

                        <div>
                            <strong>
                                Frontend Developer
                            </strong>

                            <small>
                                Ready to collaborate
                            </small>
                        </div>

                        <span className="online-dot"></span>

                    </div>

                </div>
            </section>

        </main>
    );
}

export default Login;
