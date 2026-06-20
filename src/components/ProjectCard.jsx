const ProjectCard = ({ project, actions }) => (
  <div className="project-card-floating">
    <div className="project-card-glow"></div>
    <div className="project-card-inner">
      <div className="project-status-badge">
        {project.archived ? 'archived' : project.status}
      </div>
      <h3 className="project-card-title">{project.name}</h3>
      <p className="project-card-description">{project.description}</p>

      <div className="project-code-section">
        <div className="code-label">Join Code</div>
        <div className="code-display">{project.code}</div>
      </div>

      <div className="project-stats">
        <div className="stat">
          <span className="stat-icon">👥</span>
          <span className="stat-value">{(project.students || []).length} students</span>
        </div>
        {!project.archived && (
          <div className="stat">
            <span className="stat-icon">📋</span>
            <span className="stat-value">Active</span>
          </div>
        )}
      </div>

      {actions && (
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          {actions}
        </div>
      )}
    </div>
  </div>
);

export default ProjectCard;
