import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Avatar from "../ui/Avatar/Avatar";
import Button from "../ui/Button/Button";
import ProjectTile from "./ProjectTile";
import { getProjectMessages, markChatRead, sendProjectMessage } from "../../api/endpoints";
import { usePolling } from "../../hooks/usePolling";
import { notifyChatsChanged } from "../../hooks/useUnreadMessages";
import { dayKey, formatClock, formatDayLabel } from "../../utils/time";

const POLL_MS = 3000;
const GROUP_WINDOW_MS = 5 * 60 * 1000;
const NEAR_BOTTOM_PX = 120;
const HELLO_MESSAGE = "Hello everyone \u{1F44B}";

function mergeMessages(current, incoming) {
    const seen = new Set(current.map((message) => message.id));
    const added = incoming.filter((message) => !seen.has(message.id));

    return added.length === 0 ? current : [...current, ...added];
}

// Turns messages, join events and the welcome card into one ordered list the thread can render.
function buildFeed({ chat, messages, pending, currentUserId }) {
    const events = chat.members
        .filter((member) => member.role !== "owner")
        .map((member) => ({ kind: "join", at: member.joinedAt, member }));

    const sent = messages.map((message) => ({ kind: "message", at: message.createdAt, message, own: message.sender.id === currentUserId }));

    // Messages still being sent always sit at the end, whatever this browser's clock says.
    const waiting = pending.map((item) => ({ kind: "message", at: item.createdAt, message: item, own: true, pending: item }));

    const timeline = [...events, ...sent].sort((a, b) => new Date(a.at) - new Date(b.at)).concat(waiting);

    // The welcome card sits right after your own "joined" line (or at the very top if you own the project).
    const ownJoin = timeline.findIndex((entry) => entry.kind === "join" && entry.member.id === currentUserId);
    timeline.splice(ownJoin === -1 ? 0 : ownJoin + 1, 0, { kind: "welcome" });

    const feed = [];
    let lastDay = null;

    timeline.forEach((entry) => {
        if (entry.kind !== "welcome") {
            const day = dayKey(entry.at);

            if (day !== lastDay) {
                feed.push({ kind: "day", key: `day-${day}`, label: formatDayLabel(entry.at) });
                lastDay = day;
            }
        }

        if (entry.kind === "join") {
            feed.push({ ...entry, key: `join-${entry.member.id}` });
        } else if (entry.kind === "welcome") {
            feed.push({ ...entry, key: "welcome" });
        } else {
            feed.push({ ...entry, key: entry.pending ? entry.pending.tempId : `message-${entry.message.id}`});
        }
    });

    // Group consecutive messages from one person: name on the first, avatar and time on the last.
    return feed.map((entry, index) => {
        if (entry.kind !== "message") {
            return entry;
        }

        const sameGroup = (other) =>
            other && other.kind === "message"
            && other.message.sender.id === entry.message.sender.id
            && dayKey(other.at) === dayKey(entry.at)
            && Math.abs(new Date(other.at) - new Date(entry.at)) < GROUP_WINDOW_MS;

        return {
            ...entry,
            isFirstInGroup: !sameGroup(feed[index - 1]),
            isLastInGroup: !sameGroup(feed[index + 1]),
        };
    });
}

function SendIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
            <path d="m21.854 2.147-10.94 10.939" />
        </svg>
    );
}

function JoinIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M2 21a8 8 0 0 1 13.292-6" />
            <circle cx="10" cy="8" r="5" />
            <path d="M19 16v6" />
            <path d="M22 19h-6" />
        </svg>
    );
}

function ChatThread({ chat, currentUser, onActivity }) {
    const [messages, setMessages] = useState([]);
    const [pending, setPending] = useState([]);
    const [loadState, setLoadState] = useState("loading");
    const [draft, setDraft] = useState("");

    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const stickToBottom = useRef(true);
    const fetching = useRef(false);

    const currentUserId = currentUser.id;
    const lastMessageId = messages.length > 0 ? messages[messages.length - 1].id : null;

    // Kept in a ref so a new onActivity function from the parent never restarts loading or polling.
    const onActivityRef = useRef(onActivity);

    useEffect(() => {
        onActivityRef.current = onActivity;
    });

    const markRead = useCallback(() => {
        markChatRead(chat.id)
            .then(() => {
                onActivityRef.current();
                notifyChatsChanged();
            })
            .catch(() => {
                // Not critical: the chat is marked read the next time something arrives.
            });
    }, [chat.id]);

    // First load.
    useEffect(() => {
        const controller = new AbortController();

        getProjectMessages(chat.id, { signal: controller.signal })
            .then((loaded) => {
                setMessages(loaded);
                setLoadState("ready");
                markRead();
            })
            .catch((error) => {
                if (error.name !== "AbortError") {
                    setLoadState("error");
                }
            });

        return () => controller.abort();
    }, [chat.id, markRead]);

    // Pick up new messages from teammates.
    const fetchNew = useCallback(async () => {
        if (fetching.current) {
            return;
        }

        fetching.current = true;

        try {
            const incoming = await getProjectMessages(chat.id, { after: lastMessageId });

            if (incoming.length > 0) {
                setMessages((current) => mergeMessages(current, incoming));

                if (incoming.some((message) => message.sender.id !== currentUserId)) {
                    markRead();
                }
            }
        } catch {
            // Offline or a hiccup: the next poll tries again.
        } finally {
            fetching.current = false;
        }
    }, [chat.id, lastMessageId, currentUserId, markRead]);

    usePolling(fetchNew, POLL_MS, loadState === "ready");

    const feed = useMemo(
        () => buildFeed({ chat, messages, pending, currentUserId }),
        [chat, messages, pending, currentUserId],
    );

    const hasSentMessage = messages.some((message) => message.sender.id === currentUserId) || pending.length > 0;

    // Keep the newest message in view, unless you have scrolled up to read history.
    useLayoutEffect(() => {
        const container = scrollRef.current;

        if (container && stickToBottom.current) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages.length, pending.length, loadState]);

    function handleScroll() {
        const container = scrollRef.current;
        stickToBottom.current = container.scrollHeight - container.scrollTop - container.clientHeight < NEAR_BOTTOM_PX;
    }

    async function deliver(item) {
        try {
            const saved = await sendProjectMessage(chat.id, item.content);
            setMessages((current) => mergeMessages(current, [saved]));
            setPending((current) => current.filter((entry) => entry.tempId !== item.tempId));
            onActivityRef.current();
        } catch (error) {
            setPending((current) => current.map((entry) => (
                entry.tempId === item.tempId ? { ...entry, status: "failed", error: error.message } : entry
            )));
        }
    }

    function send(content) {
        const text = content.trim();

        if (!text) {
            return;
        }

        const item = {
            tempId: `pending-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            content: text,
            createdAt: new Date().toISOString(),
            sender: { id: currentUserId },
            status: "sending",
        };

        stickToBottom.current = true;
        setPending((current) => [...current, item]);
        deliver(item);
    }

    function retry(item) {
        setPending((current) => current.map((entry) => (entry.tempId === item.tempId ? { ...entry, status: "sending" } : entry)));
        deliver(item);
    }

    function discard(item) {
        setPending((current) => current.filter((entry) => entry.tempId !== item.tempId));
    }

    function resizeInput() {
        const input = inputRef.current;

        if (input) {
            input.style.height = "auto";
            input.style.height = `${Math.min(input.scrollHeight, 140)}px`;
        }
    }

    function submitDraft() {
        send(draft);
        setDraft("");

        // Collapse the textarea back to one line once React has cleared it.
        requestAnimationFrame(resizeInput);
    }

    function handleKeyDown(event) {
        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault();
            submitDraft();
        }
    }

    return (
        <section className="chat-card chat-thread" aria-label={`${chat.title} chat`}>
            <header className="chat-thread-header">
                <Link to="/messages" className="chat-back" aria-label="Back to all chats">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                </Link>

                <ProjectTile projectId={chat.id} title={chat.title} size={40} />

                <div className="chat-thread-heading">
                    <h1>{chat.title}</h1>
                    <p>{chat.members.length} {chat.members.length === 1 ? "member" : "members"}</p>
                </div>
            </header>

            <div className="chat-scroll" ref={scrollRef} onScroll={handleScroll}>
                {loadState === "loading" && <p className="chat-status">Loading messages...</p>}

                {loadState === "error" && (
                    <p className="chat-status chat-status-error">Couldn't load this chat. Refresh the page to try again.</p>
                )}

                {loadState === "ready" && (
                    <ol className="chat-feed">
                        {feed.map((entry) => {
                            if (entry.kind === "day") {
                                return <li key={entry.key} className="chat-day"><span>{entry.label}</span></li>;
                            }

                            if (entry.kind === "join") {
                                return (
                                    <li key={entry.key} className="chat-event">
                                        <JoinIcon />
                                        <span>{entry.member.name} joined the project</span>
                                    </li>
                                );
                            }

                            if (entry.kind === "welcome") {
                                return (
                                    <li key={entry.key} className="chat-welcome">
                                        <h2>Welcome to {chat.title}</h2>
                                        <p>This is the team chat for everyone on the project. Say hello to get started.</p>
                                        {!hasSentMessage && (
                                            <Button variant="primary" onClick={() => send(HELLO_MESSAGE)}>Say hello</Button>
                                        )}
                                    </li>
                                );
                            }

                            const { message, own, pending: pendingItem } = entry;
                            const sender = chat.members.find((member) => member.id === message.sender.id) ?? message.sender;

                            return (
                                <li
                                    key={entry.key}
                                    className={`chat-message ${own ? "chat-message-own" : ""} ${entry.isLastInGroup ? "" : "chat-message-tight"}`}
                                >
                                    {!own && (
                                        <span className="chat-message-avatar">
                                            {entry.isLastInGroup && <Avatar name={sender.name} avatarUrl={sender.avatarUrl} size={32} />}
                                        </span>
                                    )}

                                    <div className="chat-message-body">
                                        {!own && entry.isFirstInGroup && <span className="chat-message-author">{sender.name}</span>}

                                        <p className={`chat-bubble ${pendingItem?.status === "failed" ? "chat-bubble-failed" : ""}`}>
                                            {message.content}
                                        </p>

                                        {pendingItem?.status === "failed" ? (
                                            <span className="chat-message-meta chat-message-failed">
                                                Not sent.
                                                <button type="button" onClick={() => retry(pendingItem)}>Retry</button>
                                                <button type="button" onClick={() => discard(pendingItem)}>Discard</button>
                                            </span>
                                        ) : entry.isLastInGroup && (
                                            <span className="chat-message-meta">
                                                {pendingItem ? "Sending..." : formatClock(message.createdAt)}
                                            </span>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ol>
                )}
            </div>

            <div className="chat-composer">
                <textarea
                    ref={inputRef}
                    rows={1}
                    maxLength={5000}
                    value={draft}
                    placeholder={`Message ${chat.title}`}
                    aria-label={`Message ${chat.title}`}
                    disabled={loadState !== "ready"}
                    onChange={(event) => {
                        setDraft(event.target.value);
                        resizeInput();
                    }}
                    onKeyDown={handleKeyDown}
                />

                <button type="button" className="chat-send" aria-label="Send message" disabled={!draft.trim()} onClick={submitDraft}>
                    <SendIcon />
                </button>
            </div>
        </section>
    );
}

export default ChatThread;