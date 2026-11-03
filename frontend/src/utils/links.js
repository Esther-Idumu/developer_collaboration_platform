export function displayLink(url = "") {
    return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

export function githubHandle(url = "") {
    return displayLink(url).split("/").pop();
}

export function normalizeGithub(input = "") {
    const value = input.trim();

    if (!value) {
        return "";
    }

    if (/^https?:\/\//i.test(value)) {
        return value;
    }

    const handle = value.replace(/^@/, "").replace(/^(www\.)?github\.com\//i, "").replace(/\/$/, "");

    if (!/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(handle)) {
        return null;
    }

    return `https://github.com/${handle}`;
}

export function normalizePortfolio(input = "") {
    const value = input.trim();

    if (!value) {
        return "";
    }

    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;

    if (/\s/.test(withProtocol) || !/^https?:\/\/[^/\s]+\.[^/\s]+/i.test(withProtocol)) {
        return null;
    }

    return withProtocol;
}
