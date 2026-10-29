import "./Topbar.css";

function Topbar () {
    return (
        <header className="top-bar">
                    <form className="search" action="/search-results" method="GET" role="search">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                        </svg>
                        <input
                            type="search"
                            name="search"
                            placeholder="Search projects, developers, skills..."
                            aria-label="Search projects, developers, skills..."
                        />
                    </form>
        </header>
    )
}

export default Topbar;