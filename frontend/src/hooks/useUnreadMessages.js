import { useCallback, useEffect, useState } from "react";
import { getUnreadChatCount } from "../api/endpoints";
import { usePolling } from "./usePolling";

export const CHATS_CHANGED_EVENT = "devlink:chats-changed";

export function notifyChatsChanged() {
    window.dispatchEvent(new Event(CHATS_CHANGED_EVENT));
}

export function useUnreadMessages() {
    const [count, setCount] = useState(0);

    const refresh = useCallback(() => {
        getUnreadChatCount()
            .then(setCount)
            .catch(() => {
            });
    }, []);

    useEffect(() => {
        refresh();
        window.addEventListener(CHATS_CHANGED_EVENT, refresh);

        return () => window.removeEventListener(CHATS_CHANGED_EVENT, refresh);
    }, [refresh]);

    usePolling(refresh, 20000);

    return count;
}
