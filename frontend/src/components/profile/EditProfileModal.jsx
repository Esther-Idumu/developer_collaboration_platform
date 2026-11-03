import { useEffect, useRef, useState } from "react";
import Modal from "../Modal/Modal";
import Avatar from "../ui/Avatar/Avatar";
import Button from "../ui/Button/Button";
import { updateMyProfile } from "../../api/endpoints";
import "./ProfileEdit.css";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;
const PHOTO_TYPES = ["image/png", "image/jpeg"];

function EditProfileModal({ profile, onClose, onSaved }) {
    const [fullName, setFullName] = useState(profile.full_name);
    const [headline, setHeadline] = useState(profile.headline);
    const [photo, setPhoto] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [photoError, setPhotoError] = useState("");
    const [error, setError] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    function handlePhotoChange(event) {
        const file = event.target.files[0];

        event.target.value = "";

        if (!file) {
            return;
        }

        if (!PHOTO_TYPES.includes(file.type)) {
            setPhotoError("Photo must be a JPG or PNG image.");
            return;
        }

        if (file.size > MAX_PHOTO_BYTES) {
            setPhotoError("Photo must be 2 MB or smaller.");
            return;
        }

        setPhotoError("");
        setPhoto(file);
        setPreviewUrl(URL.createObjectURL(file));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const name = fullName.trim();

        if (!name) {
            setError("Please enter your name.");
            return;
        }

        const changes = {};

        if (name !== profile.full_name) {
            changes.full_name = name;
        }

        if (headline.trim() !== profile.headline) {
            changes.headline = headline.trim();
        }

        if (!photo && Object.keys(changes).length === 0) {
            onClose();
            return;
        }

        let body = changes;

        if (photo) {
            body = new FormData();
            Object.entries(changes).forEach(([key, value]) => body.append(key, value));
            body.append("avatar", photo);
        }

        setIsSaving(true);
        setError("");

        try {
            const updated = await updateMyProfile(body);
            onSaved(updated);
        } catch (requestError) {
            setError(requestError.message);
            setIsSaving(false);
        }
    }

    return (
        <Modal title="Edit profile" onClose={onClose} isBusy={isSaving}>
            <form onSubmit={handleSubmit} noValidate>
                <div className="edit-photo">
                    <Avatar name={fullName || profile.name} avatarUrl={previewUrl ?? profile.avatar_url} size={72} />

                    <div className="edit-photo-controls">
                        <Button size="sm" onClick={() => fileInputRef.current.click()} disabled={isSaving}>
                            Change photo
                        </Button>

                        <p className={`edit-photo-hint ${photoError ? "edit-photo-hint-error" : ""}`}>
                            {photoError || "JPG or PNG, up to 2 MB"}
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="visually-hidden"
                        onChange={handlePhotoChange}
                        tabIndex={-1}
                    />
                </div>

                <label className="form-field">
                    <span className="form-label">Full name</span>
                    <input
                        className="form-input"
                        type="text"
                        value={fullName}
                        maxLength={100}
                        onChange={(event) => setFullName(event.target.value)}
                        data-autofocus
                    />
                </label>

                <label className="form-field">
                    <span className="form-label">Title</span>
                    <input
                        className="form-input"
                        type="text"
                        value={headline}
                        maxLength={100}
                        placeholder="Developer"
                        onChange={(event) => setHeadline(event.target.value)}
                    />
                </label>

                {error && <p className="form-error" role="alert">{error}</p>}

                <div className="modal-actions">
                    <Button onClick={onClose} disabled={isSaving}>Cancel</Button>
                    <Button type="submit" variant="primary" disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default EditProfileModal;
