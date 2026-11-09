import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import SearchInput from "../SearchInput/SearchInput";
import ProjectTile from "./ProjectTile";
import { formatChatListTime } from "../../utils/time";

function firstName(name = "") {
    return name.trim().split(/\s+/)[0] || name;
}

function previewText(chat, currentUserId) {
    const message = chat.lastMessage;

    if (!message) {
        return null;
    }

    const author = message.sender.id === currentUserId ? "You" : firstName(message.sender.name);
    return `${author}: ${message.content}`;
}

function ChatList({ chats, currentUserId }) {
    const [search, setSearch] = useState("");

    const visibleChats = useMemo(() => {
        const query = search.trim().toLowerCase();
        return query ? chats.filter((chat) => chat.title.toLowerCase().includes(query)) : chats;
    }, [chats, search]);

    return (
        <section className="chat-card chat-list" aria-label="Project chats">
            <div className="chat-list-search">
                <SearchInput value={search} onChange={setSearch} placeholder="Search project chats..." label="Search project chats" />
            </div>

            <ul className="chat-list-items">
                {visibleChats.map((chat) => {
                    const preview = previewText(chat, currentUserId);
                    const time = formatChatListTime(chat.lastMessage?.createdAt);

                    return (
                        <li key={chat.projectId}>
                            <NavLink to={`/messages/${chat.projectId}`} className="chat-list-item">
                                <ProjectTile projectId={chat.projectId} title={chat.title} />

                                <span className="chat-list-text">
                                    <span className="chat-list-title">{chat.title}</span>
                                    {preview
                                        ? <span className="chat-list-preview">{preview}</span>
                                        : <span className="chat-list-preview chat-list-preview-empty">No messages yet</span>}
                                    {time && <span className="chat-list-time">{time}</span>}
                                </span>

                                {chat.unreadCount > 0 && (
                                    <span className="chat-unread" aria-label={`${chat.unreadCount} unread messages`}>
                                        {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                                    </span>
                                )}
                            </NavLink>
                        </li>
                    );
                })}

                {visibleChats.length === 0 && (
                    <li className="chat-list-empty">No chats match "{search.trim()}".</li>
                )}
            </ul>
        </section>
    );
}

export default ChatList;
