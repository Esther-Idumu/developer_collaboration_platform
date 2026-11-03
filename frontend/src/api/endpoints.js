import { apiFetch } from "./client";

function toProject(project) {
    return {
        ...project,
        newApplications: project.new_applications ?? 0,
        members: (project.members ?? []).map((member) => ({ ...member, avatarUrl: member.avatar_url })),
    };
}

function toDeveloper(developer) {
    return { ...developer, avatarUrl: developer.avatar_url };
}

export async function getMyProjects(signal) {
    const projects = await apiFetch("/projects/mine", { signal });
    return projects.map(toProject);
}

export async function getOpenProjects(signal) {
    const projects = await apiFetch("/projects/", { signal });
    return projects.map(toProject);
}

export async function getSuggestedDevelopers(signal) {
    const developers = await apiFetch("/accounts/developers?limit=4", { signal });
    return developers.map(toDeveloper);
}

export async function getDevelopers({ search = '', skill = '', limit = 50, signal } = {}) {
    const params = new URLSearchParams({ limit: String(limit) });
    if (search.trim()) params.set('search', search.trim());
    if (skill.trim()) params.set('skill', skill.trim());
    const developers = await apiFetch(`/accounts/developers?${params.toString()}`, { signal });
    return developers.map(toDeveloper);
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

// Full profile of any user (use your own id for "My Profile").
export function getProfile(id, signal) {
    return apiFetch(`/accounts/profile/${id}`, { signal });
}

// Projects the user owns or belongs to; each project's `role` is relative to THAT user.
export async function getUserProjects(id, signal) {
    const projects = await apiFetch(`/projects/user/${id}`, { signal });
    return projects.map(toProject);
}

// `changes` is a plain object (JSON) or a FormData when a photo is included.
// Resolves with the updated profile.
export function updateMyProfile(changes) {
    return apiFetch("/accounts/profile", { method: "PATCH", body: changes });
}
