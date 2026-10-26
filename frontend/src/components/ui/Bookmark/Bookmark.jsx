import { useState } from "react";
import "./Bookmark.css";

function Bookmark() {
    const [saved, setSaved] = useState(false);

    return (
        <button type="button" className={`bookmark ${saved ? "saved" : ""}`} aria-label={saved ? "Saved Project" : "Save Project"} onClick={() => setSaved(prev => !prev)}>
            <svg xmlns="http://www.w3.org/2000/svg" 
            width="17" 
            height="17" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="square" 
            strokeLinejoin="square" 
            >
            <path d="M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z"/>
            </svg>
        </button>
    );
}

export default Bookmark;