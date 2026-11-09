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

export async function getSavedProjects(signal) {
    const saved = await apiFetch('/projects/saved', { signal });
    return saved.map((entry) => toProject(entry.project));
}

export function saveProject(projectId) {
    return apiFetch(`/projects/${projectId}/save`, { method: 'POST' });
}

export function unsaveProject(projectId) {
    return apiFetch(`/projects/${projectId}/save`, { method: 'DELETE' });
}

function toChatMessage(message) {
    return {
        id: message.id,
        content: message.content,
        createdAt: message.created_at,
        sender: { ...message.sender, avatarUrl: message.sender.avatar_url },
    };
}

export async function getChats(signal) {
    const chats = await apiFetch("/projects/chats", { signal });

    return chats.map((chat) => ({
        projectId: chat.project_id,
        title: chat.title,
        memberCount: chat.member_count,
        unreadCount: chat.unread_count,
        lastActivity: chat.last_activity,
        lastMessage: chat.last_message ? toChatMessage(chat.last_message) : null,
    }));
}

export async function getUnreadChatCount(signal) {
    const data = await apiFetch("/projects/chats/unread", { signal });
    return data.count;
}

export async function getProjectChat(projectId, signal) {
    const chat = await apiFetch(`/projects/${projectId}/chat`, { signal });

    return {
        id: chat.id,
        title: chat.title,
        members: chat.members.map((member) => ({
            id: member.id,
            name: member.name,
            avatarUrl: member.avatar_url,
            role: member.role,
            joinedAt: member.joined_at,
        })),
    };
}

// Pass `after` (a message id) to fetch only messages newer than it.
export async function getProjectMessages(projectId, { after, signal } = {}) {
    const query = after ? `?after=${after}` : "";
    const messages = await apiFetch(`/projects/${projectId}/messages${query}`, { signal });
    return messages.map(toChatMessage);
}

export async function sendProjectMessage(projectId, content) {
    return toChatMessage(await apiFetch(`/projects/${projectId}/messages`, {
        method: "POST",
        body: { content },
    }));
}

export function markChatRead(projectId) {
    return apiFetch(`/projects/${projectId}/messages/read`, { method: "POST" });
}

export function getProfile(id, signal) {
    return apiFetch(`/accounts/profile/${id}`, { signal });
}

export async function getUserProjects(id, signal) {
    const projects = await apiFetch(`/projects/user/${id}`, { signal });
    return projects.map(toProject);
}

export function updateMyProfile(changes) {
    return apiFetch("/accounts/profile", { method: "PATCH", body: changes });
}

function toPerson(person) {
    return { ...person, avatarUrl: person.avatar_url };
}

function toApplication(application) {
    return {
        id: application.id,
        status: application.status,
        message: application.message,
        role: application.role,
        project: application.project,
        createdAt: application.created_at,
        updatedAt: application.updated_at,
        viewedAt: application.viewed_at,
        applicant: toPerson(application.applicant),
        owner: toPerson(application.owner),
    };
}

export async function getReceivedApplications(signal) {
    const applications = await apiFetch("/projects/applications/received", { signal });
    return applications.map(toApplication);
}

export async function getSentApplications(signal) {
    const applications = await apiFetch("/projects/applications/sent", { signal });
    return applications.map(toApplication);
}

export async function markApplicationViewed(applicationId) {
    return toApplication(await apiFetch(`/projects/applications/${applicationId}/viewed`, { method: "PATCH" }));
}

export function decideApplication(applicationId, decision) {
    return apiFetch(`/projects/applications/${applicationId}/decision`, {
        method: "PATCH",
        body: { decision },
    });
}

export function withdrawApplication(applicationId) {
    return apiFetch(`/projects/applications/${applicationId}/withdraw`, { method: "PATCH" });
}

export async function getProject(projectId, signal) {
    const project = await apiFetch(`/projects/${projectId}`, { signal });

    return {
        ...toProject(project),
        createdAt: project.created_at,
        githubUrl: project.github_url,
        websiteUrl: project.website_url,
        isSaved: project.is_saved,
        owner: toPerson(project.owner),
        team: project.team.map(toPerson),
        roles: project.roles.map((role) => ({
            ...role,
            noOfDevelopers: role.no_of_developers,
            myApplication: role.my_application,
        })),
    };
}

export function applyToRole(projectRoleId, message) {
    return apiFetch("/projects/applications", {
        method: "POST",
        body: { project_role: projectRoleId, message },
    });
}
