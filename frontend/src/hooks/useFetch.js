import { useEffect, useState } from "react";


export function useFetch(fetcher) {
    const [state, setState] = useState({ data: null, error: null, isLoading: true });

    useEffect(() => {
        const controller = new AbortController();

        fetcher(controller.signal)
            .then((data) => setState({ data, error: null, isLoading: false }))
            .catch((error) => {
                if (error.name === "AbortError") {
                    return;
                }

                setState({ data: null, error, isLoading: false });
            });

        return () => controller.abort();
    }, [fetcher]);

    return state;
}
