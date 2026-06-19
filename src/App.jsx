import { useState, useEffect } from 'react';

const tabConfig = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

const App = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [role, setRole] = useState('student');
  const [statusMessage, setStatusMessage] = useState('');
  const [authUser, setAuthUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('authUser')) || null;
    } catch (e) {
      return null;
    }
  });

  const isAdmin = activeTab === 'admin-login';
  const isRegister = activeTab === 'register';
  const actionLabel = isAdmin ? 'Sign in as Admin' : isRegister ? 'Create account' : 'Log in';
  const roleLabel = isAdmin ? 'Admin' : role === 'student' ? 'Student' : 'Lecturer';

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const userRole = isAdmin ? 'admin' : role;
    const user = {
      role: userRole,
      email: payload.email,
      name: payload.name || (payload.email ? payload.email.split('@')[0] : ''),
    };
    setAuthUser(user);
    localStorage.setItem('authUser', JSON.stringify(user));
    setStatusMessage(`${user.role} ${isAdmin ? 'login' : isRegister ? 'registration' : 'login'} successful for ${user.name || user.email}.`);
    form.reset();
    setActiveTab(null);
  };

  useEffect(() => {
    if (authUser) localStorage.setItem('authUser', JSON.stringify(authUser));
  }, [authUser]);

  const handleLogout = () => {
    setAuthUser(null);
    localStorage.removeItem('authUser');
    setStatusMessage('Signed out');
    setRole('student');
  };

  return (
    <div className="page-shell">
      <div className="background-lights"></div>
      <nav className="floating-nav">
        <div className="brand" aria-label="Bottlenecks">
          <svg className="brand-mark" width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0%" stopColor="#6b67ff" />
                <stop offset="100%" stopColor="#30d6ff" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="20" height="20" rx="5" fill="url(#g1)" opacity="0.95" />
            <path d="M7 9c1.5-2 5-2 6 0 1 2 1 6-3 8" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="brand-text">Bottlenecks</span>
        </div>
        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#vision">Vision</a>

          {!authUser ? (
            <>
              <button
                className={`nav-action ${activeTab === 'login' ? 'selected' : ''}`}
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setStatusMessage('');
                }}
                aria-label="Login"
              >
                <span className="nav-label">Login</span>
              </button>

              <button
                className={`nav-action ${activeTab === 'register' ? 'selected' : ''}`}
                type="button"
                onClick={() => {
                  setActiveTab('register');
                  setStatusMessage('');
                }}
                aria-label="Register"
              >
                <span className="nav-label">Register</span>
              </button>

              <button
                className="admin-access"
                type="button"
                onClick={() => {
                  setActiveTab('admin-login');
                  setStatusMessage('');
                }}
                aria-label="Admin login"
              >
                <svg className="admin-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="4" y="10" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M8 10V8a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="sr-only">Admin</span>
              </button>
            </>
          ) : (
            <>
              {authUser.role === 'lecturer' && (
                <a className="nav-action" href="#projects">
                  <span className="nav-label">Projects</span>
                </a>
              )}
              <div className="profile-inline">
                <div className="profile-badge">{(authUser.name || authUser.email || 'User').split(' ')[0].slice(0,2).toUpperCase()}</div>
                <div className="profile-info">
                  <div className="profile-name">{authUser.name || authUser.email}</div>
                  <div className="profile-role">{authUser.role}</div>
                </div>
                <button className="btn-logout" onClick={handleLogout}>Sign out</button>
              </div>
            </>
          )}
        </div>
      </nav>

      <main className="hero-layout">
        <section className="hero-copy">
          <span className="eyebrow">Project Team AI</span>
          <h1>Next-gen student team formation and task allocation.</h1>
          <p>
            Build stronger project groups, align lecturers with the right teams, and manage admin access with a premium glassmorphism interface.
          </p>
          <div className="hero-buttons">
            <a className="btn btn-primary" href="#showcase">
              Learn more
            </a>
          </div>
        </section>

        {/* showcase removed for a clean minimal body */}

          {activeTab && (isAdmin || activeTab === 'login' || isRegister) && (
            <div className="modal-backdrop" onClick={() => setActiveTab(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <button className="modal-close" onClick={() => setActiveTab(null)} aria-label="Close">✕</button>
                <h3 className="modal-title">{isAdmin ? 'Admin Login' : isRegister ? 'Register' : 'Login'}</h3>
                <p className="modal-sub">{isAdmin ? 'Admin access only.' : isRegister ? `Create a ${role} account` : `Sign in to your ${role} account`}</p>

                <form className="modal-form" onSubmit={handleSubmit}>
                  {!isAdmin && !isRegister && (
                    <div className="role-select">
                      <label className={`role-pill ${role === 'student' ? 'selected' : ''}`} onClick={() => setRole('student')}>Student</label>
                      <label className={`role-pill ${role === 'lecturer' ? 'selected' : ''}`} onClick={() => setRole('lecturer')}>Lecturer</label>
                    </div>
                  )}

                  <label>
                    Email
                    <input name="email" type="email" placeholder="you@school.edu" required />
                  </label>

                  <label>
                    Password
                    <input name="password" type="password" placeholder="••••••••" required />
                  </label>

                  {isRegister && role === 'student' && (
                    <>
                      <label>
                        Full name
                        <input name="name" type="text" placeholder="Maya Kim" required />
                      </label>
                      <label>
                        Major
                        <input name="major" type="text" placeholder="Software Engineering" />
                      </label>
                    </>
                  )}

                  {isRegister && role === 'lecturer' && (
                    <>
                      <label>
                        Full name
                        <input name="name" type="text" placeholder="Dr. Alex Park" required />
                      </label>
                      <label>
                        Department
                        <input name="department" type="text" placeholder="Computer Science" />
                      </label>
                    </>
                  )}

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-glow">{isAdmin ? 'Sign in' : isRegister ? 'Create account' : 'Sign in'}</button>
                    <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(isRegister ? 'login' : 'register')}>{isRegister ? 'Switch to Login' : 'Create account'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </main>

      {/* Clean body: minimal layout; show projects for lecturer */}
      {authUser && authUser.role === 'lecturer' && (
        <section id="projects" className="projects-section">
          <div className="project-card">Course Projects — Spring 2026</div>
          <div className="project-card">Supervised Projects — Group Allocations</div>
          <div className="project-card">Pending Approvals</div>
        </section>
      )}
    </div>
  );
};

export default App;
