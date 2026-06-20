import { useState, useEffect } from 'react';
import NavTabs from './components/NavTabs';
import ProfileCard from './components/ProfileCard';
import ProjectCard from './components/ProjectCard';
import SkillsSection from './components/SkillsSection';
import ArchivedProjects from './components/ArchivedProjects';
import { generateProjectCode } from './utils/generateProjectCode';

const LECTURER_TABS = [
  { key: 'profile', label: 'Lecturer Profile' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'archived', label: 'Archived Projects' },
];

const STUDENT_TABS = [
  { key: 'profile', label: 'Student Profile' },
  { key: 'projects', label: 'Projects' },
  { key: 'skills', label: 'Skills' },
  { key: 'archived', label: 'Archived Projects' },
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
  const [lecturerTab, setLecturerTab] = useState('profile');
  const [studentTab, setStudentTab] = useState('profile');
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Web Development Bootcamp',
      code: 'WDB2026',
      description: 'Spring 2026 web dev project',
      status: 'ongoing',
      archived: false,
      students: [
        { id: 's1', name: 'Maya Kim', skills: { 'Web Dev': 4, 'React': 5 } },
        { id: 's2', name: 'Jon Lee', skills: { 'Web Dev': 3, 'CSS': 4 } },
      ],
    },
    {
      id: 2,
      name: 'AI Research Initiative',
      code: 'AIR2026',
      description: 'Machine learning research project',
      status: 'ongoing',
      archived: false,
      students: [
        { id: 's3', name: 'Aisha Khan', skills: { 'ML': 5, 'Python': 5 } },
      ],
    },
    {
      id: 3,
      name: 'Mobile App Development',
      code: 'MAD2026',
      description: 'Cross-platform app development',
      status: 'archived',
      archived: true,
      students: [
        { id: 's4', name: 'Liam Chen', skills: { 'Mobile': 4, 'UX': 3 } },
      ],
    },
  ]);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({ name: '', description: '' });
  const [showStudentJoin, setShowStudentJoin] = useState(false);
  const [studentJoinCode, setStudentJoinCode] = useState('');
  const [studentJoinName, setStudentJoinName] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);

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

  useEffect(() => {
    if (!statusMessage) return;
    const t = setTimeout(() => setStatusMessage(''), 8000);
    return () => clearTimeout(t);
  }, [statusMessage]);

  const handleManageProject = (project) => {
    setSelectedProject(project);
  };

  const handleCloseManage = () => {
    setSelectedProject(null);
  };

  const handleStudentJoin = (e) => {
    e.preventDefault();
    const code = studentJoinCode.trim();
    const name = authUser.name || studentJoinName.trim();
    if (!code) { setStatusMessage('Please enter a project code'); return; }
    const proj = projects.find(p => p.code.toUpperCase() === code.toUpperCase() && !p.archived);
    if (!proj) { setStatusMessage('Project not found for that code'); return; }
    const newStudent = { id: `s_${Date.now()}`, name: name || 'Student', skills: {} };
    setProjects(projects.map(p => p.id === proj.id ? { ...p, students: [...(p.students || []), newStudent] } : p));
    setStatusMessage(`Joined ${proj.name} as ${newStudent.name}`);
    setStudentJoinCode(''); setStudentJoinName(''); setShowStudentJoin(false);
  };

  const portalLabel = authUser && authUser.role === 'lecturer'
    ? 'Lecturer Portal'
    : authUser && authUser.role === 'student'
      ? 'Student Portal'
      : 'Bottlenecks';

  return (
    <div className="page-shell">
      <div className="background-lights"></div>
      <nav className="floating-nav">
        <div className="brand" aria-label={portalLabel}>
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
          <span className="brand-text">{portalLabel}</span>
        </div>
        <div className={`nav-links ${authUser && (authUser.role === 'lecturer' || authUser.role === 'student') ? 'nav-lecturer' : ''}`}>
          {authUser && authUser.role === 'lecturer' && (
            <NavTabs tabs={LECTURER_TABS} activeTab={lecturerTab} onTabChange={setLecturerTab} />
          )}

          {authUser && authUser.role === 'student' && (
            <NavTabs tabs={STUDENT_TABS} activeTab={studentTab} onTabChange={setStudentTab} />
          )}

          {!authUser && (
            <>
              <a href="#features">Features</a>
              <a href="#vision">Vision</a>
            </>
          )}

          {!authUser ? (
            <>
              <button
                className={`nav-action ${activeTab === 'login' ? 'selected' : ''}`}
                type="button"
                onClick={() => { setActiveTab('login'); setStatusMessage(''); }}
                aria-label="Login"
              >
                <span className="nav-label">Login</span>
              </button>

              <button
                className={`nav-action ${activeTab === 'register' ? 'selected' : ''}`}
                type="button"
                onClick={() => { setActiveTab('register'); setStatusMessage(''); }}
                aria-label="Register"
              >
                <span className="nav-label">Register</span>
              </button>

              <button
                className="admin-access"
                type="button"
                onClick={() => { setActiveTab('admin-login'); setStatusMessage(''); }}
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
            <div className="profile-inline">
              <div className="profile-badge">{(authUser.name || authUser.email || 'User').split(' ')[0].slice(0,2).toUpperCase()}</div>
              <div className="profile-info">
                <div className="profile-name">{authUser.name || authUser.email}</div>
                <div className="profile-role">{authUser.role}</div>
              </div>
              <button className="btn-logout" onClick={handleLogout}>Sign out</button>
            </div>
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
            <ProfileCard user={authUser} title="Student Profile" roleIcon="🎯" />
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
                    <form onSubmit={handleStudentJoin}>
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
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </section>
          )}

          {studentTab === 'skills' && <SkillsSection />}
          {studentTab === 'archived' && <ArchivedProjects projects={projects} />}
        </>
      )}

      {/* Lecturer portal */}
      {authUser && authUser.role === 'lecturer' && (
        <>
          {lecturerTab === 'profile' && (
            <ProfileCard user={authUser} title="Lecturer Profile" roleIcon="🎓" />
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
                    <ProjectCard
                      key={project.id}
                      project={project}
                      actions={
                        <button className="btn-project-action" onClick={() => handleManageProject(project)}>Manage Project</button>
                      }
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {lecturerTab === 'skills' && <SkillsSection />}
          {lecturerTab === 'archived' && <ArchivedProjects projects={projects} />}
        </>
      )}
    </div>
  );
};

export default App;
