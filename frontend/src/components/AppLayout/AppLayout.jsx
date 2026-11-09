import { Outlet, useMatch } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./AppLayout.css";

function AppLayout() {
    // The chat fills the whole screen and scrolls inside its own panels instead of the page.
    const isChat = Boolean(useMatch("/messages/*"));

    return (
        <div className="app-layout">
            <Sidebar />

            <div className={`main-area ${isChat ? "main-area-chat" : ""}`}>
                <Topbar />

                <main className={`page-content ${isChat ? "page-content-chat" : ""}`}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
