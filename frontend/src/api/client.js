export const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const ACCESS_KEY = "access_token";
const REFRESH_KEY = "refresh_token";

export const AUTH_EXPIRED_EVENT = "devlink:auth-expired";

export class ApiError extends Error {
    constructor(message, status, data = null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}

export function clearSession() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
}

function messageFrom(data, fallback) {
    if (!data || typeof data !== "object") {
        return fallback;
    }

    for (const key of ["detail", "error", "message"]) {
        if (typeof data[key] === "string") {
            return data[key];
        }
    }

    const firstValue = Object.values(data)[0];
    if (Array.isArray(firstValue) && typeof firstValue[0] === "string") {
        return firstValue[0];
    }

    return fallback;
}

async function send(path, { method = "GET", body, signal } = {}, token) {
    const headers = {};

    // FormData (file uploads) must NOT get a Content-Type: the browser adds it with the boundary.
    const isFormData = body instanceof FormData;

    if (body !== undefined && !isFormData) {
        headers["Content-Type"] = "application/json";
    }

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    try {
        return await fetch(`${API_URL}${path}`, {
            method,
            headers,
            signal,
            body: body === undefined || isFormData ? body : JSON.stringify(body),
        });
    } catch (error) {
        if (error.name === "AbortError") {
            throw error;
        }

        throw new ApiError("Unable to connect to the server. Please try again.", 0);
    }
}

let refreshInFlight = null;

async function refreshAccessToken() {
    const refresh = localStorage.getItem(REFRESH_KEY);

    if (!refresh) {
        throw new ApiError("Session expired.", 401);
    }

    const response = await send("/accounts/token/refresh", {
        method: "POST",
        body: { refresh },
    });

    if (!response.ok) {
        throw new ApiError("Session expired.", 401);
    }

    const data = await response.json();

    localStorage.setItem(ACCESS_KEY, data.access);

    // Only present if the backend rotates refresh tokens.
    if (data.refresh) {
        localStorage.setItem(REFRESH_KEY, data.refresh);
    }

    return data.access;
}

export async function apiFetch(path, options = {}) {
    let response = await send(path, options, localStorage.getItem(ACCESS_KEY));

    if (response.status === 401) {
        try {
            refreshInFlight ??= refreshAccessToken().finally(() => {
                refreshInFlight = null;
            });

            const newToken = await refreshInFlight;
            response = await send(path, options, newToken);
        } catch (error) {
            if (error.name === "AbortError") {
                throw error;
            }

            clearSession();
            window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
            throw new ApiError("Your session has expired. Please log in again.", 401);
        }
    }

    const data = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(messageFrom(data, "Something went wrong."), response.status, data);
    }

    return data;
}
