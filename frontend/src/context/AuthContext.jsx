import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    async function fetchCurrentUser(accessToken) {

        try {
            const response = await fetch(
                "http://127.0.0.1:8000/api/accounts/me/",
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Authentication failed");
            }

            const data = await response.json();

            setUser(data);

            return data;

        } catch (error) {
            console.error("Failed to fetch current user:", error);

            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");

            setUser(null);

        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {

        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            fetchCurrentUser(accessToken);
        } else {
            setIsLoading(false);
        }

    }, []);

    function login(accessToken, refreshToken, userData) {

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

        setUser(userData);
    }

    function logout() {

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}