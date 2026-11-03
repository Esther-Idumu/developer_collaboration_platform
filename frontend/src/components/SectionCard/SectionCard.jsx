import { Link } from "react-router-dom";
import "./SectionCard.css";

function SectionCard({ title, linkTo, linkLabel = "See all", actions, className = "", children }) {
    return (
        <section className={`section-card ${className}`.trim()}>
            <header className="section-card-header">
                <h2 className="section-card-title">{title}</h2>

                {actions && <div className="section-card-actions">{actions}</div>}

                {linkTo && (
                    <Link to={linkTo} className="section-card-link">
                        {linkLabel}
                    </Link>
                )}
            </header>

            {children}
        </section>
    );
}

export default SectionCard;
