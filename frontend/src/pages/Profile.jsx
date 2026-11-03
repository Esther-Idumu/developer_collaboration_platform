import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFetch } from "../hooks/useFetch";
import { getProfile, getUserProjects } from "../api/endpoints";
import { formatMonthYear } from "../utils/format";
import PageHeader from "../components/PageHeader/PageHeader";
import SectionCard from "../components/SectionCard/SectionCard";
import PersonalInfoCard from "../components/profile/PersonalInfoCard";
import AboutSkillsCard from "../components/profile/AboutSkillsCard";
import EditProfileModal from "../components/profile/EditProfileModal";
import Avatar from "../components/ui/Avatar/Avatar";
import Button from "../components/ui/Button/Button";
import OwnershipBadge from "../components/ui/OwnershipBadge/OwnershipBadge";
import StatusPill from "../components/ui/StatusPill/StatusPill";
import "./Profile.css";

function Message({ children, error = false }) {
    return (
        <p className={`section-message ${error ? "section-message-error" : ""}`}>
            {children}
        </p>
    );
}

function ProfileContent({ id }) {
    const { user, updateProfile: syncSignedInProfile } = useAuth();

    const fetchProfile = useCallback((signal) => getProfile(id, signal), [id]);
    const fetchProjects = useCallback((signal) => getUserProjects(id, signal), [id]);

    const profileRequest = useFetch(fetchProfile);
    const projectsRequest = useFetch(fetchProjects);

    // Latest profile returned by a save; it replaces what was first loaded.
    const [savedProfile, setSavedProfile] = useState(null);

    // Which part is being edited: null, "identity" (the dialog), "personal" or "about".
    // While this is set, nothing else on the page can be edited.
    const [editing, setEditing] = useState(null);

    const isOwnProfile = Number(id) === user.id;
    const title = isOwnProfile ? "My Profile" : "Developer Profile";
    const profile = savedProfile ?? profileRequest.data;

    function stopEditing() {
        setEditing(null);
    }

    function handleSaved(updatedProfile) {
        setSavedProfile(updatedProfile);
        syncSignedInProfile(updatedProfile);
        setEditing(null);
    }

    if (profileRequest.isLoading) {
        return (
            <>
                <PageHeader title={title} />
                <Message>Loading profile...</Message>
            </>
        );
    }

    if (profileRequest.error) {
        const notFound = profileRequest.error.status === 404;

        return (
            <>
                <PageHeader title={title} />
                <Message error={!notFound}>
                    {notFound
                        ? "This profile doesn't exist."
                        : `We couldn't load this profile. ${profileRequest.error.message}`}
                </Message>
            </>
        );
    }

    const role = profile.headline || "Developer";
    const somethingIsBeingEdited = editing !== null;

    return (
        <div className="profile-page">
            <PageHeader title={title} />

            <section className="profile-identity">
                <Avatar name={profile.name} avatarUrl={profile.avatar_url} size={88} />

                <div className="profile-identity-text">
                    <h2 className="profile-identity-name">{profile.name}</h2>
                    <p className="profile-identity-role">{role}</p>
                    <p className="profile-identity-joined">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Joined {formatMonthYear(profile.joined_at)}
                    </p>
                </div>

                {isOwnProfile && (
                    <Button
                        variant="primary"
                        size="sm"
                        disabled={somethingIsBeingEdited}
                        onClick={() => setEditing("identity")}
                    >
                        Edit profile
                    </Button>
                )}
            </section>

            <PersonalInfoCard
                profile={profile}
                isOwn={isOwnProfile}
                isEditing={editing === "personal"}
                isLocked={somethingIsBeingEdited}
                onEdit={() => setEditing("personal")}
                onCancel={stopEditing}
                onSaved={handleSaved}
            />

            <AboutSkillsCard
                profile={profile}
                isOwn={isOwnProfile}
                isEditing={editing === "about"}
                isLocked={somethingIsBeingEdited}
                onEdit={() => setEditing("about")}
                onCancel={stopEditing}
                onSaved={handleSaved}
            />

            <SectionCard title="Projects" className="profile-card">
                {projectsRequest.isLoading && <Message>Loading projects...</Message>}

                {projectsRequest.error && (
                    <Message error>We couldn't load projects. {projectsRequest.error.message}</Message>
                )}

                {projectsRequest.data && projectsRequest.data.length === 0 && (
                    <p className="profile-empty">No projects yet.</p>
                )}

                {projectsRequest.data && projectsRequest.data.length > 0 && (
                    <ul className="profile-projects">
                        {projectsRequest.data.map((project) => (
                            <li key={project.id} className="profile-project">
                                <span className="profile-project-title">{project.title}</span>

                                <span className="profile-project-tags">
                                    <OwnershipBadge role={project.role} />
                                    <StatusPill status={project.status} />
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </SectionCard>

            {editing === "identity" && (
                <EditProfileModal profile={profile} onClose={stopEditing} onSaved={handleSaved} />
            )}
        </div>
    );
}

function Profile() {
    const { id } = useParams();

    // Keyed by id so moving between profiles starts from a clean state.
    return <ProfileContent key={id} id={id} />;
}

export default Profile;
