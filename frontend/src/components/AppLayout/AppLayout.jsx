import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar/Sidebar";
import Topbar from "../Topbar/Topbar";
import "./AppLayout.css";

function AppLayout() {
    return (
        <div className="app-layout">
            <Sidebar />

            <div className="main-area">
                <Topbar />

                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
