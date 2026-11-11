const TILE_COLORS = ["#4F46E5", "#0EA5E9", "#059669", "#D97706", "#E11D48", "#7C3AED", "#0D9488"];

function getProjectInitials(title = "") {
    const words = title.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
        return "?";
    }

    if (words.length === 1) {
        return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
}

function ProjectTile({ projectId, title, size = 40 }) {
    const color = TILE_COLORS[projectId % TILE_COLORS.length];

    return (
        <span
            className="project-tile"
            aria-hidden="true"
            style={{ "--tile-size": `${size}px`, "--tile-color": color }}
        >
            {getProjectInitials(title)}
        </span>
    );
}

export default ProjectTile;