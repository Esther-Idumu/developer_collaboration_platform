import Avatar, { getInitials } from "../Avatar/Avatar";
import "./AvatarStack.css";

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