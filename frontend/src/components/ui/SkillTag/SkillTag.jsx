import "./SkillTag.css";

function SkillTag({ title }) {
    if (!title) {
        return null;
    }

    return (
        <span className="skill-tag">
            {title}
        </span>
    )
}

export default SkillTag;