import { apiFetch } from "./client";

function toProject(project) {
    return { ...project, newApplications: project.new_applications ?? 0 };
}

export async function getMyProjects(signal) {
    const projects = await apiFetch("/projects/mine", { signal });
    return projects.map(toProject);
}

export async function getOpenProjects(signal) {
    const projects = await apiFetch("/projects/", { signal });
    return projects.map(toProject);
}

export function getSuggestedDevelopers(signal) {
    return apiFetch("/accounts/developers?limit=4", { signal });
}

export function getDevelopers({ search = '', skill = '', limit = 50, signal } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    if (skill.trim()) params.set('skill', skill.trim());
    return apiFetch(`/accounts/developers?${params.toString()}`, { signal });
}

export function getSavedProjects(signal) {
    return apiFetch('/projects/saved', { signal });
}

export function saveProject(projectId) {
    return apiFetch(`/projects/${projectId}/save`, { method: 'POST' });
}

export function unsaveProject(projectId) {
    return apiFetch(`/projects/${projectId}/save`, { method: 'DELETE' });
}

export function getProjectMessages(projectId, signal) {
    return apiFetch(`/projects/${projectId}/messages`, { signal });
}

export function sendProjectMessage(projectId, content) {
    return apiFetch(`/projects/${projectId}/messages`, {
        method: 'POST',
        body: { content },
    });
}
