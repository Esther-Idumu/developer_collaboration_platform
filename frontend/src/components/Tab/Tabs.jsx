import "./Tabs.css";

function Tabs({ tabs = [], activeTab, onChange }) {
    if (tabs.length === 0) {
        return null;
    }

    return (
        <div className="tabs" role="tablist">
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`tabs-tab ${isActive ? "active" : ""}`}
                        onClick={() => onChange(tab.id)}
                    >
                        {tab.label}
                    </button>
                );
            })}
        </div>
    );
}

export default Tabs;