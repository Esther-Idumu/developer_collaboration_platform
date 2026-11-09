import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDisplayName, getHeadline } from "../../utils/user";
import Avatar from "../ui/Avatar/Avatar";
import { useUnreadMessages } from "../../hooks/useUnreadMessages";
import "./Sidebar.css";

const SMALL_SCREEN = "(max-width: 768px)";

function NavIcon({ children }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            {children}
        </svg>
    );
}

const MENU_ITEMS = [
    {
        to: "/home",
        label: "Home",
        icon: (
            <>
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </>
        ),
    },
    {
        to: "/my-projects",
        label: "My Projects",
        icon: (
            <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
        ),
    },
    {
        to: "/applications",
        label: "Applications",
        icon: (
            <>
                <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                <path d="M10 9H8" />
                <path d="M16 13H8" />
                <path d="M16 17H8" />
            </>
        ),
    },
    {
        to: "/messages",
        label: "Messages",
        showUnread: true,
        icon: (
            <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z" />
        ),
    },
];

function Sidebar() {
    const { user } = useAuth();
    const unreadMessages = useUnreadMessages();
    const [sideBarClosed, setSideBarClosed] = useState(() => window.matchMedia(SMALL_SCREEN).matches );

    useEffect(() => {
        const query = window.matchMedia(SMALL_SCREEN);

        function handleChange(event) {
            if (event.matches) {
                setSideBarClosed(true);
            }
        }

        query.addEventListener("change", handleChange);

        return () => query.removeEventListener("change", handleChange);
    }, []);

    const name = getDisplayName(user);

    return (
        <aside className={`side-bar ${sideBarClosed ? "collapsed" : ""}`}>

            <div className="sidebar-header">
                <h1>Dev<span>Link</span></h1>

                <button className="close-sidebar" type="button" aria-label={sideBarClosed ? "Open sidebar" : "Close sidebar"} aria-expanded={!sideBarClosed} onClick={() => setSideBarClosed(prev => !prev)}>
                    <svg xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    >
                    <rect width="18" height="18" x="3" y="3" rx="2"/>
                    <path d="M9 3v18"/>
                    </svg>
                </button>
            </div>

            <nav className="top-nav">
                <h2>MENU</h2>

                {MENU_ITEMS.map((item) => (
                    <NavLink key={item.to} to={item.to}>
                        <NavIcon>{item.icon}</NavIcon>
                        <span className="link-label">{item.label}</span>
                        {item.showUnread && unreadMessages > 0 && (
                            <span className="badge" aria-label={`${unreadMessages} unread messages`}>
                                {unreadMessages > 99 ? "99+" : unreadMessages}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="bottom-nav">
                <div className="profile">
                    <Avatar name={name} avatarUrl={user.profile?.avatar_url} size={34} />

                    <div className="profile-text">
                        <p className="profile-name">{name}</p>
                        <p className="profile-role">{getHeadline(user)}</p>
                    </div>
                </div>

                <nav className="profile-nav">

                    <NavLink to={`/profile/${user.id}`}>
                        <NavIcon>
                            <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
                            <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                            <circle cx="10" cy="7" r="4" />
                        </NavIcon>
                        <span className="link-label">Profile</span>
                    </NavLink>

                    <NavLink to="/settings">
                        <NavIcon>
                            <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
                            <circle cx="12" cy="12" r="3" />
                        </NavIcon>
                        <span className="link-label">Settings</span>
                    </NavLink>

                </nav>
            </div>
        </aside>
    );
}

export default Sidebar;
