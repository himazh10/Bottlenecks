const NavTabs = ({ tabs, activeTab, onTabChange }) => (
  <>
    {tabs.map(({ key, label }) => (
      <button
        key={key}
        className={`nav-action ${activeTab === key ? 'selected' : ''}`}
        type="button"
        onClick={() => onTabChange(key)}
      >
        <span className="nav-label">{label}</span>
      </button>
    ))}
  </>
);

export default NavTabs;
