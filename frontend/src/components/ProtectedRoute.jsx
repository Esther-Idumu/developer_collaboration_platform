import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default ProtectedRoute;