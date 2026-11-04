import { useState } from "react";
import Modal from "../Modal/Modal";
import Button from "../ui/Button/Button";
import { applyToRole } from "../../api/endpoints";
import "../profile/ProfileEdit.css";
import "./ApplyModal.css";

const MAX_LENGTH = 1000;

function ApplyModal({ role, projectTitle, onClose, onApplied }) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmed = message.trim();

        if (!trimmed) {
            setError("Write a short message to the project owner.");
            return;
        }

        setIsSending(true);
        setError("");

        try {
            const result = await applyToRole(role.id, trimmed);
            onApplied(role.id, result.application);
        } catch (requestError) {
            setError(requestError.message);
            setIsSending(false);
        }
    }

    return (
        <Modal title={`Apply as ${role.title}`} onClose={onClose} isBusy={isSending}>
            <form onSubmit={handleSubmit} noValidate>
                <p className="apply-modal-intro">
                    Tell the owner of {projectTitle} why you'd be a good fit for this role.
                </p>

                <label className="form-field">
                    <span className="form-label">Your message</span>
                    <textarea
                        className="form-input form-textarea"
                        rows={6}
                        maxLength={MAX_LENGTH}
                        value={message}
                        placeholder="What have you built that's relevant, and how much time can you commit?"
                        onChange={(event) => setMessage(event.target.value)}
                        data-autofocus
                    />
                    <span className="form-counter">{message.length} / {MAX_LENGTH}</span>
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="modal-actions">
                    <Button onClick={onClose} disabled={isSending}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSending}>
                        {isSending ? "Sending..." : "Send application"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default ApplyModal;
