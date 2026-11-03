import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDisplayName } from "../../utils/user";
import Avatar from "../ui/Avatar/Avatar";
import "./Topbar.css";

function Topbar({ hasNotifications = false }) {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [query, setQuery] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        function handlePointerDown(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                setMenuOpen(false);
            }
        }

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [menuOpen]);

    function handleSearch(event) {
        event.preventDefault();

        const trimmed = query.trim();

        if (trimmed) {
            navigate(`/discover?q=${encodeURIComponent(trimmed)}`);
        }
    }

    function handleLogout() {
        setMenuOpen(false);
        logout();
        navigate("/login");
    }

    const name = getDisplayName(user);

    return (
        <header className="top-bar">
            <form className="search" onSubmit={handleSearch} role="search">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                    type="search"
                    name="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search projects, developers, skills..."
                    aria-label="Search projects, developers, skills..."
                />
            </form>

            <div className="top-bar-actions">
                <Link to="/applications" className="icon-button" aria-label="Notifications">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10.268 21a2 2 0 0 0 3.464 0" />
                        <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
                    </svg>
                    {hasNotifications && <span className="icon-button-dot" />}
                </Link>

                <div className="profile-menu" ref={menuRef}>
                    <button
                        type="button"
                        className="profile-menu-trigger"
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label="Open profile menu"
                        onClick={() => setMenuOpen((open) => !open)}
                    >
                        <Avatar name={name} avatarUrl={user.profile?.avatar_url} size={32} />
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </button>

                    {menuOpen && (
                        <div className="profile-menu-panel" role="menu">
                            <div className="profile-menu-identity">
                                <p className="profile-menu-name">{name}</p>
                                <p className="profile-menu-email">{user.email}</p>
                            </div>

                            <Link to={`/profile/${user.id}`} className="profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                                Profile
                            </Link>

                            <Link to="/settings" className="profile-menu-item" role="menuitem" onClick={() => setMenuOpen(false)}>
                                Settings
                            </Link>

                            <button type="button" className="profile-menu-item profile-menu-item-danger" role="menuitem" onClick={handleLogout}>
                                Log out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
