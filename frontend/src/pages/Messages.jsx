import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getChats, getProjectChat } from "../api/endpoints";
import { usePolling } from "../hooks/usePolling";
import ChatList from "../components/chat/ChatList";
import ChatThread from "../components/chat/ChatThread";
import MembersPanel from "../components/chat/MembersPanel";
import "./Messages.css";

const WIDE_SCREEN = "(min-width: 901px)";
const ROOMY_SCREEN = "(min-width: 1281px)";

function Notice({ title, children }) {
    return (
        <section className="chat-card chat-notice">
            <h2>{title}</h2>
            <p>{children}</p>
        </section>
    );
}

function Messages() {
    const { user } = useAuth();
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [chats, setChats] = useState(null);
    const [chatsFailed, setChatsFailed] = useState(false);
    const [chatInfo, setChatInfo] = useState({ projectId: null, data: null, error: null });
    // Members start open on big screens and tucked into the slim rail on smaller ones.
    const [membersOpen, setMembersOpen] = useState(() => window.matchMedia(ROOMY_SCREEN).matches);

    const refreshChats = useCallback(() => {
        return getChats()
            .then((loaded) => {
                setChats(loaded);
                setChatsFailed(false);
            })
            .catch(() => setChatsFailed(true));
    }, []);

    useEffect(() => {
        refreshChats();
    }, [refreshChats]);

    usePolling(refreshChats, 8000);

    // Header and member list for the open chat. Re-checked now and then so new members show up.
    const loadChatInfo = useCallback((signal) => {
        if (!projectId) {
            return;
        }

        getProjectChat(projectId, signal)
            .then((data) => setChatInfo({ projectId, data, error: null }))
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setChatInfo({ projectId, data: null, error });
                }
            });
    }, [projectId]);

    useEffect(() => {
        const controller = new AbortController();
        loadChatInfo(controller.signal);

        return () => controller.abort();
    }, [loadChatInfo]);

    usePolling(loadChatInfo, 30000, Boolean(projectId));

    // On a wide screen, open the most recent chat straight away.
    useEffect(() => {
        if (!projectId && chats && chats.length > 0 && window.matchMedia(WIDE_SCREEN).matches) {
            navigate(`/messages/${chats[0].projectId}`, { replace: true });
        }
    }, [projectId, chats, navigate]);

    const info = chatInfo.projectId === projectId ? chatInfo : null;
    const hasChats = chats && chats.length > 0;

    let thread;

    if (!projectId) {
        thread = (
            <section className="chat-card chat-notice chat-placeholder">
                <h2>{hasChats ? "Select a chat" : "No project chats yet"}</h2>
                <p>
                    {hasChats
                        ? "Pick a project from the list to see its conversation."
                        : "You get a group chat for every project you own or join."}
                </p>
                {!hasChats && chats && <Link to="/home" className="chat-placeholder-link">Find a project to join</Link>}
            </section>
        );
    } else if (info?.error) {
        const noAccess = info.error.status === 403 || info.error.status === 404;

        thread = (
            <Notice title={noAccess ? "Chat not available" : "Couldn't load this chat"}>
                {noAccess ? "You can only open chats for projects you own or have joined." : info.error.message}
            </Notice>
        );
    } else if (!info?.data) {
        thread = <Notice title="Loading chat...">One moment.</Notice>;
    } else {
        thread = <ChatThread key={info.data.id} chat={info.data} currentUser={user} onActivity={refreshChats} />;
    }

    return (
        <div className={`messages-page ${projectId ? "has-thread" : ""} ${membersOpen ? "" : "members-collapsed"}`}>
            {chatsFailed && !chats ? (
                <Notice title="Couldn't load your chats">Check your connection and refresh the page.</Notice>
            ) : chats === null ? (
                <section className="chat-card chat-list"><p className="chat-status">Loading chats...</p></section>
            ) : (
                <ChatList chats={chats} currentUserId={user.id} />
            )}

            {thread}

            {info?.data && (
                <MembersPanel
                    members={info.data.members}
                    currentUserId={user.id}
                    open={membersOpen}
                    onToggle={() => setMembersOpen((open) => !open)}
                />
            )}
        </div>
    );
}

export default Messages;
