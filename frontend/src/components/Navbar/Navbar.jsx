import { useState } from "react";
import "./Navbar.css";

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav>
            <div className="nav-brand">
                <a href="/">
                    <span>Dev</span>Link
                </a>
            </div>

            <div className={`nav-links ${menuOpen ? "open" : ""}`}>
                <a href="#discover" onClick={() => setMenuOpen(false)}>
                    Discover
                </a>

                <a href="#projects" onClick={() => setMenuOpen(false)}>
                    Projects
                </a>

                <a href="#developers" onClick={() => setMenuOpen(false)}>
                    Developers
                </a>

                <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
                    How it works
                </a>

                <div className="mobile-actions">
                    <a href="/login" className="login">
                        Log in
                    </a>

                    <a href="/signup" className="sign-up">
                        Get started
                    </a>
                </div>
            </div>

            <div className="nav-actions">
                <a href="/login" className="login">
                    Log in
                </a>

                <a href="/signup" className="sign-up">
                    Get started
                </a>
            </div>

            <button
                className="menu-toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation menu"
            >
                <span></span>
                <span></span>
                <span></span>
            </button>
        </nav>
    );
}

export default Navbar;