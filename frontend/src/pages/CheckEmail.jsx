import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./CheckEmail.css";

function CheckEmail() {

    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isSending, setIsSending] = useState(false);

    async function handleResend() {

        if (!email) {
            return;
        }

        setMessage("");
        setError("");
        setIsSending(true);

        try {

            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/resend-verification/",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.detail ||
                    data.email?.[0] ||
                    "Unable to resend verification email."
                );

                return;
            }

            setMessage(
                "If an account exists with this email, a new verification email has been sent."
            );

        } catch (error) {

            console.error(
                "Resend verification error:",
                error
            );

            setError(
                "Unable to connect to the server. Please try again."
            );

        } finally {
            setIsSending(false);
        }
    }

    return (
        <main className="check-email-page">

            <div className="check-email-card">

                <a href="/" className="check-email-brand">
                    <span>Dev</span>Link
                </a>

                <div className="check-email-icon">
                    <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                    >
                        <rect x="3" y="5" width="18" height="14" rx="2" />
                        <path d="m3 7 9 6 9-6" />
                    </svg>
                </div>

                <p className="eyebrow">
                    ONE MORE STEP
                </p>

                <h1>Check your email</h1>

                <p className="check-email-message">
                    We've sent a verification link to:
                </p>

                {email && (
                    <p className="check-email-address">
                        {email}
                    </p>
                )}

                <p className="check-email-help">
                    Click the link in the email to verify your
                    account and continue to DevLink.
                </p>

                {message && (
                    <p className="check-email-success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="check-email-error">
                        {error}
                    </p>
                )}

                <div className="check-email-actions">

                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isSending || !email}
                    >
                        {isSending
                            ? "Sending..."
                            : "Resend verification email"}
                    </button>

                    <button
                        type="button"
                        className="secondary-button"
                        onClick={() => navigate("/signup")}
                    >
                        Use a different email
                    </button>

                </div>

            </div>

        </main>
    );
}

export default CheckEmail;