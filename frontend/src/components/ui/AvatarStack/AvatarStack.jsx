import { useState } from "react";
import "./AvatarStack.css";

function getInitials(name = "") {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    if (parts.length === 0) {
        return "?";
    }

    const first = parts[0][0];
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";

    return (first + last).toUpperCase();
}

function Avatar({ name, avatarUrl }) {
    const [imageFailed, setImageFailed] = useState(false);
    const showImage = avatarUrl && !imageFailed;

    return (
        <span className="avatar" title={name} aria-label={name}>
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

function AvatarStack({ people = [], max = 2, size = 32}) {
    if (people.length === 0) {
        return null;
    }

    const visible = people.slice(0, max);
    const extra = people.length - visible.length;

    return (
        <div className="avatar-stack" style={{ "--avatar-size": `${size}px` }}>
            {visible.map((person) => (
                <Avatar key={person.id} name={person.name} avatarUrl={person.avatarUrl}/>
            ))}

            {extra > 0 && (
                <span className="avatar avatar-more" aria-label={`${extra} more`}>
                    +{extra}
                </span>
            )}
        </div>
    );
}

export default AvatarStack;