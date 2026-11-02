import { Link } from "react-router-dom";
import "./Button.css";

function Button({ variant = "secondary", icon, to, children, ...rest }) {
    const className = `button button-${variant}`;

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