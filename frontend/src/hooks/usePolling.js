import { useEffect, useRef } from "react";

export function usePolling(callback, intervalMs, enabled = true) {
    const savedCallback = useRef(callback);

    useEffect(() => {
        savedCallback.current = callback;
    });

    useEffect(() => {
        if (!enabled) {
            return;
        }

        const timer = setInterval(() => {
            if (!document.hidden) {
                savedCallback.current();
            }
        }, intervalMs);

        function handleVisibility() {
            if (!document.hidden) {
                savedCallback.current();
            }
        }

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(timer);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, [intervalMs, enabled]);
}
