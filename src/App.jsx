import { useState, useEffect } from 'react';
import {
  tabConfig,
  defaultProjects,
  generateProjectCode,
  buildUserFromPayload,
  buildStatusMessage,
  getProfileInitials,
  getBrandText,
  getActionLabel,
  getRoleLabel,
  loadAuthUser,
} from './utils.js';

const App = () => {
  const [activeTab, setActiveTab] = useState(null);
  const [role, setRole] = useState('student');
  const [statusMessage, setStatusMessage] = useState('');
  const [authUser, setAuthUser] = useState(() => loadAuthUser());

  const isAdmin = activeTab === 'admin-login';
  const isRegister = activeTab === 'register';
  const [lecturerTab, setLecturerTab] = useState('profile');
  const [studentTab, setStudentTab] = useState('profile');
  const [projects, setProjects] = useState(defaultProjects);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', description: '' });
  const [showStudentJoin, setShowStudentJoin] = useState(false);
  const [studentJoinCode, setStudentJoinCode] = useState('');
  const [studentJoinName, setStudentJoinName] = useState('');
  const actionLabel = getActionLabel(isAdmin, isRegister);
  const roleLabel = getRoleLabel(isAdmin, role);

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const user = buildUserFromPayload(payload, isAdmin, role);
    setAuthUser(user);
    localStorage.setItem('authUser', JSON.stringify(user));
    setStatusMessage(buildStatusMessage(user, isAdmin, isRegister));
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


  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectForm.name.trim()) {
      setStatusMessage('Project name is required');
      return;
    }
    const newProject = {
      id: projects.length + 1,
      name: newProjectForm.name,
      description: newProjectForm.description,
      code: generateProjectCode(),
      status: 'ongoing',
      archived: false,
      students: [],
    };
    setProjects([...projects, newProject]);
    setStatusMessage(`Project created! Code: ${newProject.code}`);
    setNewProjectForm({ name: '', description: '' });
    setShowCreateProject(false);
  };

  // auto-dismiss status messages after a short timeout
  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(''), 8000);
    return () => clearTimeout(t);
  }, [statusMessage]);

  const [selectedProject, setSelectedProject] = useState(null);

  const handleManageProject = (project) => {
    setSelectedProject(project);
  };

  const handleCloseManage = () => {
    setSelectedProject(null);
  };

  return (
    <div className="page-shell">
      <div className="background-lights"></div>
      <nav className="floating-nav">
        <div className="brand" aria-label={getBrandText(authUser)}>
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
          <span className="brand-text">{getBrandText(authUser)}</span>
        </div>
        <div className={`nav-links ${authUser && (authUser.role === 'lecturer' || authUser.role === 'student') ? 'nav-lecturer' : ''}`}>
          {authUser && authUser.role === 'lecturer' ? (
            <>
              <button
                className={`nav-action ${lecturerTab === 'profile' ? 'selected' : ''}`}
                type="button"
                onClick={() => setLecturerTab('profile')}
              >
                <span className="nav-label">Lecturer Profile</span>
              </button>

              <button
                className={`nav-action ${lecturerTab === 'projects' ? 'selected' : ''}`}
                type="button"
                onClick={() => setLecturerTab('projects')}
              >
                <span className="nav-label">Projects</span>
              </button>

              <button
                className={`nav-action ${lecturerTab === 'skills' ? 'selected' : ''}`}
                type="button"
                onClick={() => setLecturerTab('skills')}
              >
                <span className="nav-label">Skills</span>
              </button>

              <button
                className={`nav-action ${lecturerTab === 'archived' ? 'selected' : ''}`}
                type="button"
                onClick={() => setLecturerTab('archived')}
              >
                <span className="nav-label">Archived Projects</span>
              </button>
            </>
          ) : !authUser ? (
            <>
              <a href="#features">Features</a>
              <a href="#vision">Vision</a>
            </>
          ) : null}

          {authUser && authUser.role === 'student' && (
            <>
              <button
                className={`nav-action ${studentTab === 'profile' ? 'selected' : ''}`}
                type="button"
                onClick={() => setStudentTab('profile')}
              >
                <span className="nav-label">Student Profile</span>
              </button>

              <button
                className={`nav-action ${studentTab === 'projects' ? 'selected' : ''}`}
                type="button"
                onClick={() => setStudentTab('projects')}
              >
                <span className="nav-label">Projects</span>
              </button>

              <button
                className={`nav-action ${studentTab === 'skills' ? 'selected' : ''}`}
                type="button"
                onClick={() => setStudentTab('skills')}
              >
                <span className="nav-label">Skills</span>
              </button>

              <button
                className={`nav-action ${studentTab === 'archived' ? 'selected' : ''}`}
                type="button"
                onClick={() => setStudentTab('archived')}
              >
                <span className="nav-label">Archived Projects</span>
              </button>
            </>
          )}

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
              {/* removed duplicate Projects link — primary nav already contains Projects for lecturers */}
              <div className="profile-inline">
                <div className="profile-badge">{getProfileInitials(authUser.name || authUser.email || 'User')}</div>
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

      {(!authUser) && (
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
                  {!isAdmin && (
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
                    {!isAdmin && (
                      <button type="button" className="btn btn-secondary" onClick={() => setActiveTab(isRegister ? 'login' : 'register')}>{isRegister ? 'Switch to Login' : 'Create account'}</button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      )}
      
      {/* Student portal */}
      {authUser && authUser.role === 'student' && (
        <>
          {studentTab === 'profile' && (
            <section id="student-profile" className="profile-section">
              <div className="profile-card">
                <div className="profile-card-glow"></div>
                <div className="profile-card-inner">
                  <div className="profile-header-banner">
                    <svg className="banner-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>

                  <div className="profile-avatar-large">{getProfileInitials(authUser.name || authUser.email || 'St')}</div>

                  <div className="profile-card-content">
                    <h2 className="profile-card-title">Student Profile</h2>

                    <div className="profile-details-grid">
                      <div className="detail-item">
                        <div className="detail-icon">👤</div>
                        <div className="detail-info">
                          <div className="detail-label">Name</div>
                          <div className="detail-value">{authUser.name || authUser.email}</div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">✉️</div>
                        <div className="detail-info">
                          <div className="detail-label">Email</div>
                          <div className="detail-value">{authUser.email}</div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">🎯</div>
                        <div className="detail-info">
                          <div className="detail-label">Role</div>
                          <div className="detail-value">{authUser.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {studentTab === 'projects' && (
            <section id="student-projects" className="projects-section">
              <div className="projects-header">
                <h2>Projects</h2>
                <button className="btn-create-project" onClick={() => setShowStudentJoin(!showStudentJoin)}>
                  <span>Join Project</span>
                </button>
              </div>

              {showStudentJoin && (
                <div className="create-project-form-container">
                  <div className="create-project-form">
                    <h3>Join Project by Code</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const code = studentJoinCode.trim();
                      const name = authUser.name || studentJoinName.trim();
                      if (!code) { setStatusMessage('Please enter a project code'); return; }
                      const proj = projects.find(p => p.code.toUpperCase() === code.toUpperCase() && !p.archived);
                      if (!proj) { setStatusMessage('Project not found for that code'); return; }
                      const newStudent = { id: `s_${Date.now()}`, name: name || 'Student', skills: {} };
                      setProjects(projects.map(p => p.id === proj.id ? { ...p, students: [...(p.students||[]), newStudent] } : p));
                      setStatusMessage(`Joined ${proj.name} as ${newStudent.name}`);
                      setStudentJoinCode(''); setStudentJoinName(''); setShowStudentJoin(false);
                    }}>
                      {!authUser.name && (
                        <label>
                          Your name
                          <input value={studentJoinName} onChange={(e) => setStudentJoinName(e.target.value)} placeholder="Your full name" required />
                        </label>
                      )}
                      <label>
                        Project code
                        <input value={studentJoinCode} onChange={(e) => setStudentJoinCode(e.target.value)} placeholder="ABCDEFG1" required />
                      </label>
                      <div className="form-actions">
                        <button type="submit" className="btn-submit">Join</button>
                        <button type="button" className="btn-cancel" onClick={() => setShowStudentJoin(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="projects-grid">
                {projects.filter(p => !p.archived).map((project) => (
                  <div key={project.id} className="project-card-floating">
                    <div className="project-card-glow"></div>
                    <div className="project-card-inner">
                      <div className="project-status-badge">{project.archived ? 'archived' : project.status}</div>
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
                        <div className="stat">
                          <span className="stat-icon">📋</span>
                          <span className="stat-value">{project.archived ? 'Archived' : 'Active'}</span>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {studentTab === 'skills' && (
            <section id="skills" className="skills-section">
              <h2>Skills</h2>
              <div className="skills-grid">
                <div className="skill-pill">Machine Learning</div>
                <div className="skill-pill">Web Dev</div>
                <div className="skill-pill">Data Science</div>
              </div>
            </section>
          )}

          {studentTab === 'archived' && (
            <section id="archived" className="archived-section">
              <h2>Archived Projects</h2>
              <div className="projects-grid">
                {projects.filter(p => p.archived).map(p => (
                  <div key={p.id} className="project-card-floating">
                    <div className="project-card-glow"></div>
                    <div className="project-card-inner">
                      <div className="project-status-badge">archived</div>
                      <h3 className="project-card-title">{p.name}</h3>
                      <p className="project-card-description">{p.description}</p>
                      <div className="project-code-section">
                        <div className="code-label">Join Code</div>
                        <div className="code-display">{p.code}</div>
                      </div>
                      <div className="project-stats">
                        <div className="stat">
                          <span className="stat-icon">👥</span>
                          <span className="stat-value">{(p.students||[]).length} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Clean body: minimal layout; show projects for lecturer */}
      {authUser && authUser.role === 'lecturer' && (
        <>
          {lecturerTab === 'profile' && (
            <section id="profile" className="profile-section">
              <div className="profile-card">
                <div className="profile-card-glow"></div>
                <div className="profile-card-inner">
                  <div className="profile-header-banner">
                    <svg className="banner-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  
                  <div className="profile-avatar-large">{getProfileInitials(authUser.name || authUser.email || 'Lec')}</div>
                  
                  <div className="profile-card-content">
                    <h2 className="profile-card-title">Lecturer Profile</h2>
                    
                    <div className="profile-details-grid">
                      <div className="detail-item">
                        <div className="detail-icon">👤</div>
                        <div className="detail-info">
                          <div className="detail-label">Name</div>
                          <div className="detail-value">{authUser.name || authUser.email}</div>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-icon">✉️</div>
                        <div className="detail-info">
                          <div className="detail-label">Email</div>
                          <div className="detail-value">{authUser.email}</div>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <div className="detail-icon">🎓</div>
                        <div className="detail-info">
                          <div className="detail-label">Role</div>
                          <div className="detail-value">{authUser.role}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {lecturerTab === 'projects' && (
            <section id="projects" className="projects-section">
              <div className="projects-header">
                <h2>Projects</h2>
                <button 
                  className="btn-create-project"
                  onClick={() => setShowCreateProject(!showCreateProject)}
                >
                  <span>+ Create Project</span>
                </button>
              </div>

              {showCreateProject && (
                <div className="create-project-form-container">
                  <div className="create-project-form">
                    <h3>Create New Project</h3>
                    <form onSubmit={handleCreateProject}>
                      <div>
                        <label>Project Name</label>
                        <input
                          type="text"
                          placeholder="Enter project name..."
                          value={newProjectForm.name}
                          onChange={(e) => setNewProjectForm({ ...newProjectForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label>Description</label>
                        <textarea
                          placeholder="Enter project description..."
                          value={newProjectForm.description}
                          onChange={(e) => setNewProjectForm({ ...newProjectForm, description: e.target.value })}
                          rows="4"
                        />
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn-submit">Create Project</button>
                        <button 
                          type="button" 
                          className="btn-cancel"
                          onClick={() => setShowCreateProject(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {statusMessage && <div className="status-alert">{statusMessage}</div>}

              {selectedProject ? (
                <div className="manage-project-panel">
                  <div className="manage-header">
                    <button className="btn-cancel" onClick={handleCloseManage}>← Back</button>
                    <h3>Manage: {selectedProject.name}</h3>
                    <div className="code-display" style={{marginLeft:'auto'}}>{selectedProject.code}</div>
                  </div>

                  <div className="manage-body">
                    <table className="students-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Skills</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProject.students && selectedProject.students.length > 0 ? (
                          selectedProject.students.map((s) => (
                            <tr key={s.id}>
                              <td>{s.name}</td>
                              <td>
                                {Object.entries(s.skills || {}).map(([skill, level]) => (
                                  <div key={skill} className="skill-row">
                                    <span className="skill-name">{skill}</span>
                                    <span className="skill-stars">{'★'.repeat(level)}{'☆'.repeat(Math.max(0, 5 - level))}</span>
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan="2">No students have joined this project yet.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="projects-grid">
                  {projects.filter(p => !p.archived).map((project) => (
                    <div key={project.id} className="project-card-floating">
                      <div className="project-card-glow"></div>
                      <div className="project-card-inner">
                        <div className="project-status-badge">{project.archived ? 'archived' : project.status}</div>
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
                          <div className="stat">
                            <span className="stat-icon">📋</span>
                            <span className="stat-value">{project.archived ? 'Archived' : 'Active'}</span>
                          </div>
                        </div>

                        <div style={{display:'flex', gap:'0.6rem'}}>
                          <button className="btn-project-action" onClick={() => handleManageProject(project)}>Manage Project</button>
                          
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {lecturerTab === 'skills' && (
            <section id="skills" className="skills-section">
              <h2>Skills</h2>
              <div className="skills-grid">
                <div className="skill-pill">Machine Learning</div>
                <div className="skill-pill">Web Dev</div>
                <div className="skill-pill">Data Science</div>
              </div>
            </section>
          )}

          {lecturerTab === 'archived' && (
            <section id="archived" className="archived-section">
              <h2>Archived Projects</h2>
              <div className="projects-grid">
                {projects.filter(p => p.archived).map(p => (
                  <div key={p.id} className="project-card-floating">
                    <div className="project-card-glow"></div>
                    <div className="project-card-inner">
                      <div className="project-status-badge">archived</div>
                      <h3 className="project-card-title">{p.name}</h3>
                      <p className="project-card-description">{p.description}</p>
                      <div className="project-code-section">
                        <div className="code-label">Join Code</div>
                        <div className="code-display">{p.code}</div>
                      </div>
                      <div className="project-stats">
                        <div className="stat">
                          <span className="stat-icon">👥</span>
                          <span className="stat-value">{(p.students||[]).length} students</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default App;
