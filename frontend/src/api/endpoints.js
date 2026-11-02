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
