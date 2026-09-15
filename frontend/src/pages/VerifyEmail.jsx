import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./VerifyEmail.css"

function VerifyEmail() {

    const { uid, token } = useParams();
    const navigate = useNavigate();

    const [status, setStatus] = useState("verifying");
    const [message, setMessage] = useState("");

    useEffect(() => {

        async function verifyEmail() {

            try {
                const response = await fetch(
                    `http://127.0.0.1:8000/api/accounts/verify-email/${uid}/${token}/`
                );

                const data = await response.json();

                if (!response.ok) {
                    setStatus("error");
                    setMessage(
                        data.error || "Unable to verify your email."
                    );
                    console.log("Verification response:", data);
                    return;
                }

                setStatus("success");
                setMessage(data.message);

            } catch (error) {

                console.error("Email verification error:", error);

                setStatus("error");
                setMessage(
                    "Unable to connect to the server. Please try again."
                );
            }
        }

        verifyEmail();

    }, [uid, token]);

    return (
        <main className="verify-email-page">

            <div className="verify-email-card">

                <a href="/" className="verify-email-brand">
                    <span>Dev</span>Link
                </a>

                {status === "verifying" && (
                    <>
                        <h1>Verifying your email...</h1>

                        <p>
                            Please wait while we confirm your email
                            address.
                        </p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="verify-icon success">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <path d="m5 12 4 4L19 6" />
                            </svg>
                        </div>

                        <h1>Email verified!</h1>

                        <p>
                            Your DevLink account has been verified
                            successfully.
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                        >
                            Continue to login
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <div className="verify-icon error">
                            <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                            >
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 8v4" />
                                <path d="M12 16h.01" />
                            </svg>
                        </div>

                        <h1>Verification failed</h1>

                        <p>
                            {message}
                        </p>

                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
                        >
                            Back to signup
                        </button>
                    </>
                )}

            </div>

        </main>
    );
}

export default VerifyEmail;