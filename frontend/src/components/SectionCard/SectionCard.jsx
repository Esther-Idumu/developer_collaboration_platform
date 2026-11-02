import { Link } from "react-router-dom";
import "./SectionCard.css";

function SectionCard({ title, linkTo, linkLabel = "See all", children }) {
    return (
        <section className="section-card">
            <header className="section-card-header">
                <h2 className="section-card-title">{title}</h2>

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
