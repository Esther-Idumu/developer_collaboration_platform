import { useLocation, useNavigate } from "react-router-dom";
import "./PageHeader.css";

function PageHeader({ title, fallbackTo = "/home" }) {
    const navigate = useNavigate();
    const location = useLocation();

    function handleBack() {
        if (location.key === "default") {
            navigate(fallbackTo);
        } else {
            navigate(-1);
        }
    }

    return (
        <div className="page-header">
            <button type="button" className="page-header-back" aria-label="Go back" onClick={handleBack}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                </svg>
            </button>

            <h1 className="page-header-title">{title}</h1>
        </div>
    );
}

export default PageHeader;
