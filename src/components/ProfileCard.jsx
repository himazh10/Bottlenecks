const ProfileCard = ({ user, title, roleIcon = '🎯' }) => {
  const initials = (user.name || user.email || 'U').split(' ')[0].slice(0, 2).toUpperCase();

  return (
    <section className="profile-section">
      <div className="profile-card">
        <div className="profile-card-glow"></div>
        <div className="profile-card-inner">
          <div className="profile-header-banner">
            <svg className="banner-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <div className="profile-avatar-large">{initials}</div>

          <div className="profile-card-content">
            <h2 className="profile-card-title">{title}</h2>

            <div className="profile-details-grid">
              <div className="detail-item">
                <div className="detail-icon">👤</div>
                <div className="detail-info">
                  <div className="detail-label">Name</div>
                  <div className="detail-value">{user.name || user.email}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">✉️</div>
                <div className="detail-info">
                  <div className="detail-label">Email</div>
                  <div className="detail-value">{user.email}</div>
                </div>
              </div>

              <div className="detail-item">
                <div className="detail-icon">{roleIcon}</div>
                <div className="detail-info">
                  <div className="detail-label">Role</div>
                  <div className="detail-value">{user.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileCard;
