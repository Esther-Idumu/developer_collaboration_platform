import { Link } from "react-router-dom";
import "./Button.css";

function Button({ variant = "secondary", size = "md", icon, to, children, ...rest }) {
    const className = `button button-${variant} ${size === "sm" ? "button-sm" : ""}`.trim();

    const content = (
        <>
            {icon}
            {children}
        </>
    );

    if (to) {
        return (
            <Link to={to} className={className} {...rest}>
                {content}
            </Link>
        );
    }

    return (
        <button type="button" className={className} {...rest}>
            {content}
        </button>
    );
}

export default Button;