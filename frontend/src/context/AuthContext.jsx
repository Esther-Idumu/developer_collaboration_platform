import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch, ApiError, clearSession, AUTH_EXPIRED_EVENT } from "../api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);

    const [isLoading, setIsLoading] = useState(
        () => Boolean(localStorage.getItem("access_token"))
    );

    useEffect(() => {
        if (!localStorage.getItem("access_token")) {
            return;
        }

        let cancelled = false;

        apiFetch("/accounts/me")
            .then((data) => {
                if (!cancelled) {
                    setUser(data);
                }
            })
            .catch((error) => {
                console.error("Failed to fetch current user:", error);

                if (error instanceof ApiError && error.status === 401) {
                    clearSession();
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setIsLoading(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        function handleExpired() {
            setUser(null);
        }

        window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);

        return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    }, []);

    function login(accessToken, refreshToken, userData) {

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        setUser(userData);
    }

    // Called after the user saves their profile so the sidebar and topbar update at once.
    function updateProfile(profile) {
        setUser((current) => (current ? { ...current, profile } : current));
    }

    function logout() {

        clearSession();

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
                updateProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
