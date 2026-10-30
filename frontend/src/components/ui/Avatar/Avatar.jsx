import { useState } from "react";
import "./Avatar.css";

export function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

    return (first + last).toUpperCase();
}

function Avatar({ name, avatarUrl, size }) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = avatarUrl && !imageFailed;

    return (
        <span className="avatar" title={name} aria-label={name} style={size ? {"--avatar-size": `${size}px` } : undefined}>
            {showImage ? (
                <img src={avatarUrl} alt={name} onError={() => setImageFailed(true)} />
            ) : (
                <span className="avatar-initials" aria-hidden="true">
                    {getInitials(name)}
                </span>
            )}
        </span>
    );
}

export default Avatar;