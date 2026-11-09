import Avatar from "../ui/Avatar/Avatar";

function UsersIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

function MembersPanel({ members, currentUserId, open, onToggle }) {
    if (!open) {
        return (
            <aside className="chat-card members-panel members-panel-collapsed" aria-label="Members">
                <button type="button" className="members-rail-toggle" aria-label="Show members" onClick={onToggle}>
                    <UsersIcon />
                </button>

                <ul className="members-rail-list">
                    {members.map((member) => (
                        <li key={member.id}>
                            <Avatar name={member.name} avatarUrl={member.avatarUrl} size={40} />
                        </li>
                    ))}
                </ul>
            </aside>
        );
    }

    return (
        <aside className="chat-card members-panel" aria-label="Members">
            <header className="members-header">
                <div>
                    <h2>Members</h2>
                    <p>{members.length} {members.length === 1 ? "person" : "people"}</p>
                </div>

                <button type="button" className="members-hide" onClick={onToggle}>Hide</button>
            </header>

            <ul className="members-list">
                {members.map((member) => (
                    <li key={member.id} className="members-row">
                        <Avatar name={member.name} avatarUrl={member.avatarUrl} size={48} />

                        <span className="members-row-text">
                            <span className="members-row-name">{member.id === currentUserId ? "You" : member.name}</span>
                            <span className="members-row-role">{member.role === "owner" ? "Owner" : "Member"}</span>
                        </span>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default MembersPanel;
