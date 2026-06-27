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
  SKILL_TIERS,
  SKILL_STATUS,
  calculateStudentRating,
  calculateStudentRatingFromLevels,
  createStudentGroups,
  getSkillTierBadge,
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
  const [adminTab, setAdminTab] = useState('skills');
  const [skillSubmissions, setSkillSubmissions] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillDescription, setNewSkillDescription] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const actionLabel = getActionLabel(isAdmin, isRegister);
  const roleLabel = getRoleLabel(isAdmin, role);

  const myApprovedSkills = skillSubmissions.filter(
    (s) => s.studentEmail === (authUser && authUser.email) && s.status === SKILL_STATUS.approved
  );
  const myPendingSkills = skillSubmissions.filter(
    (s) => s.studentEmail === (authUser && authUser.email) && s.status === SKILL_STATUS.pending
  );
  const myRejectedSkills = skillSubmissions.filter(
    (s) => s.studentEmail === (authUser && authUser.email) && s.status === SKILL_STATUS.rejected
  );
  const pendingForAdmin = skillSubmissions.filter((s) => s.status === SKILL_STATUS.pending);
  const allApproved = skillSubmissions.filter((s) => s.status === SKILL_STATUS.approved);

  const handleSubmitSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) {
      setStatusMessage('Skill name is required');
      return;
    }
    const submission = {
      id: `skill_${Date.now()}`,
      skillName: newSkillName.trim(),
      description: newSkillDescription.trim(),
      studentEmail: authUser.email,
      studentName: authUser.name || authUser.email,
      status: SKILL_STATUS.pending,
      tier: null,
      submittedAt: new Date().toISOString(),
    };
    setSkillSubmissions([...skillSubmissions, submission]);
    setStatusMessage(`Skill "${submission.skillName}" submitted for admin approval`);
    setNewSkillName('');
    setNewSkillDescription('');
    setShowAddSkill(false);
  };

  const registeredStudents = registeredUsers.filter((u) => u.role === 'student');
  const registeredLecturers = registeredUsers.filter((u) => u.role === 'lecturer');

  const handleApproveSkill = (skillId, tier) => {
    setSkillSubmissions(
      skillSubmissions.map((s) =>
        s.id === skillId ? { ...s, status: SKILL_STATUS.approved, tier } : s
      )
    );
    const skill = skillSubmissions.find((s) => s.id === skillId);
    setStatusMessage(`Approved "${skill.skillName}" as ${SKILL_TIERS[tier].label}`);
  };

  const handleRejectSkill = (skillId) => {
    setSkillSubmissions(
      skillSubmissions.map((s) =>
        s.id === skillId ? { ...s, status: SKILL_STATUS.rejected } : s
      )
    );
    const skill = skillSubmissions.find((s) => s.id === skillId);
    setStatusMessage(`Rejected "${skill.skillName}"`);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    const user = buildUserFromPayload(payload, isAdmin, role);
    setAuthUser(user);
    localStorage.setItem('authUser', JSON.stringify(user));
    setStatusMessage(buildStatusMessage(user, isAdmin, isRegister));
    if (!isAdmin) {
      setRegisteredUsers((prev) => {
        if (prev.some((u) => u.email === user.email)) return prev;
        return [...prev, { ...user, registeredAt: new Date().toISOString() }];
      });
    }
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
  const [showGroupSetup, setShowGroupSetup] = useState(false);
  const [groupTeamSize, setGroupTeamSize] = useState(2);
  const [selectedPreferredSkills, setSelectedPreferredSkills] = useState([]);
  const [newCustomSkill, setNewCustomSkill] = useState('');
  const [createdGroups, setCreatedGroups] = useState([]);
  const [activeStudentProjectId, setActiveStudentProjectId] = useState(null);

  const handleManageProject = (project) => {
    setSelectedProject(project);
    setShowGroupSetup(false);
    setCreatedGroups([]);
    setSelectedPreferredSkills([]);
    setGroupTeamSize(2);
    setNewCustomSkill('');
  };

  const handleCloseManage = () => {
    setSelectedProject(null);
    setShowGroupSetup(false);
    setCreatedGroups([]);
    setSelectedPreferredSkills([]);
    setGroupTeamSize(2);
    setNewCustomSkill('');
  };

  const allApprovedSkillNames = Array.from(
    new Set(allApproved.map((skill) => skill.skillName))
  );

  const currentStudentId = authUser?.email ? `s_${authUser.email}` : undefined;
  const activeStudentProject = activeStudentProjectId
    ? projects.find((project) => project.id === activeStudentProjectId)
    : null;

  const getStudentGroup = (project, studentId) =>
    (project?.groups || []).find((group) =>
      group.members.some((member) => member.id === studentId)
    );

  const handleTogglePreferredSkill = (skillName) => {
    if (selectedPreferredSkills.includes(skillName)) {
      setSelectedPreferredSkills(selectedPreferredSkills.filter((name) => name !== skillName));
    } else {
      setSelectedPreferredSkills([...selectedPreferredSkills, skillName]);
    }
  };

  const handleDragStartSkill = (event, skillName) => {
    event.dataTransfer.setData('text/plain', skillName);
  };

  const handleAllowDrop = (event) => {
    event.preventDefault();
  };

  const handleDropPreferredSkill = (event) => {
    event.preventDefault();
    const skillName = event.dataTransfer.getData('text/plain');
    if (skillName && !selectedPreferredSkills.includes(skillName)) {
      setSelectedPreferredSkills([...selectedPreferredSkills, skillName]);
    }
  };

  const handleCreateCustomSkill = () => {
    const trimmed = newCustomSkill.trim();
    if (!trimmed) {
      setStatusMessage('Please enter a custom skill name.');
      return;
    }
    if (selectedPreferredSkills.includes(trimmed)) {
      setStatusMessage(`Skill "${trimmed}" is already selected.`);
      setNewCustomSkill('');
      return;
    }
    setSelectedPreferredSkills([...selectedPreferredSkills, trimmed]);
    setNewCustomSkill('');
    setStatusMessage(`Added preferred skill "${trimmed}".`);
  };

  const handleCreateGroups = () => {
    if (!selectedProject) return;
    const size = Number(groupTeamSize);
    const studentCount = (selectedProject.students || []).length;
    if (!size || size < 1) {
      setStatusMessage('Team size must be at least 1.');
      return;
    }
    if (studentCount === 0) {
      setStatusMessage('No students have joined this project yet.');
      return;
    }
    const groups = createStudentGroups(selectedProject.students, size, selectedPreferredSkills);
    const updatedProject = { ...selectedProject, groups };
    setProjects((prevProjects) => prevProjects.map((project) => (project.id === selectedProject.id ? updatedProject : project)));
    setSelectedProject(updatedProject);
    setCreatedGroups(groups);
    setShowGroupSetup(true);
    setStatusMessage(`Created ${groups.length} groups for ${selectedProject.name}.`);
  };

  const handleVoteLeader = (projectId, groupId, candidateId) => {
    if (!authUser) {
      setStatusMessage('Please sign in to vote.');
      return;
    }
    const voterId = authUser.email ? `s_${authUser.email}` : authUser.name || '';
    if (!voterId) {
      setStatusMessage('Unable to identify voter.');
      return;
    }

    setProjects((prevProjects) => {
      return prevProjects.map((project) => {
        if (project.id !== projectId) return project;

        const updatedGroups = (project.groups || []).map((group) => {
          if (group.id !== groupId) return group;
          if (group.voteStatus === 'selected') return group;
          if (group.votes?.[voterId]) return group;

          const nextVotes = { ...(group.votes || {}), [voterId]: candidateId };
          const memberCount = group.members.length;
          const currentCandidates = group.candidateIds?.length ? [...group.candidateIds] : group.members.map((m) => m.id);
          const totalVotes = Object.keys(nextVotes).length;
          let votes = nextVotes;
          let voteRound = group.voteRound || 1;
          let voteStatus = group.voteStatus || 'pending';
          let candidateIds = currentCandidates;
          let leaderIds = group.leaderIds || [];

          if (totalVotes >= memberCount) {
            const counts = currentCandidates.reduce((acc, id) => {
              acc[id] = 0;
              return acc;
            }, {});
            Object.values(nextVotes).forEach((vote) => {
              if (counts[vote] !== undefined) counts[vote] += 1;
            });
            const maxVotes = Math.max(...Object.values(counts));
            const tied = Object.keys(counts).filter((id) => counts[id] === maxVotes);

            if (tied.length === 1) {
              voteStatus = 'selected';
              leaderIds = tied;
              candidateIds = tied;
            } else if (voteRound === 1) {
              voteRound = 2;
              voteStatus = 'runoff';
              candidateIds = tied;
              votes = {};
            } else {
              voteStatus = 'selected';
              leaderIds = tied;
              candidateIds = tied;
            }
          }

          return {
            ...group,
            votes,
            voteRound,
            voteStatus,
            candidateIds,
            leaderIds,
          };
        });

        return { ...project, groups: updatedGroups };
      });
    });

    if (selectedProject?.id === projectId) {
      setSelectedProject((current) => {
        if (!current || current.id !== projectId) return current;
        const updated = current.groups?.map((group) => {
          if (group.id !== groupId) return group;
          if (group.voteStatus === 'selected') return group;
          if (group.votes?.[authUser.email || authUser.name]) return group;
          return group;
        });
        return { ...current, groups: updated };
      });
    }

    setStatusMessage('Vote submitted.');
  };

  const handleCreateTask = (projectId, groupId, title, assigneeId) => {
    if (!authUser) { setStatusMessage('Sign in to assign tasks.'); return; }
    setProjects((prevProjects) => prevProjects.map((project) => {
      if (project.id !== projectId) return project;
      const updatedGroups = (project.groups || []).map((g) => {
        if (g.id !== groupId) return g;
        const newTask = {
          id: `t_${Date.now()}`,
          title: title || 'Untitled task',
          assigneeId,
          status: 'assigned', // assigned -> completed -> confirmed
          confirmations: {},
          createdBy: authUser.email || authUser.name || 'leader',
          createdAt: new Date().toISOString(),
        };
        return { ...g, tasks: [...(g.tasks || []), newTask] };
      });
      return { ...project, groups: updatedGroups };
    }));
    setStatusMessage('Task assigned.');
  };

  const handleMarkTaskDone = (projectId, groupId, taskId) => {
    if (!authUser) { setStatusMessage('Sign in to update tasks.'); return; }
    const actorId = authUser.email ? `s_${authUser.email}` : authUser.name;
    setProjects((prevProjects) => prevProjects.map((project) => {
      if (project.id !== projectId) return project;
      const updatedGroups = (project.groups || []).map((g) => {
        if (g.id !== groupId) return g;
        const updatedTasks = (g.tasks || []).map((t) => {
          if (t.id !== taskId) return t;
          // only assignee can mark done
          if (t.assigneeId !== actorId) return t;
          return { ...t, status: 'completed', completedAt: new Date().toISOString() };
        });
        return { ...g, tasks: updatedTasks };
      });
      return { ...project, groups: updatedGroups };
    }));
    setStatusMessage('Marked task as complete. Waiting for confirmations.');
  };

  const handleConfirmTask = (projectId, groupId, taskId) => {
    if (!authUser) { setStatusMessage('Sign in to confirm tasks.'); return; }
    const confirmerId = authUser.email ? `s_${authUser.email}` : authUser.name;
    setProjects((prevProjects) => prevProjects.map((project) => {
      if (project.id !== projectId) return project;
      const updatedGroups = (project.groups || []).map((g) => {
        if (g.id !== groupId) return g;
        const updatedTasks = (g.tasks || []).map((t) => {
          if (t.id !== taskId) return t;
          if (t.status !== 'completed') return t;
          const nextConfirmations = { ...(t.confirmations || {}), [confirmerId]: true };
          const memberCount = g.members.length;
          // exclude assignee from confirmations requirement
          const required = Math.max(0, memberCount - 1);
          const confirmedCount = Object.keys(nextConfirmations).length;
          if (confirmedCount >= required) {
            return { ...t, confirmations: nextConfirmations, status: 'confirmed', confirmedAt: new Date().toISOString() };
          }
          return { ...t, confirmations: nextConfirmations };
        });
        return { ...g, tasks: updatedTasks };
      });
      return { ...project, groups: updatedGroups };
    }));
    setStatusMessage('Confirmation recorded.');
  };

  const handleReportFakeSkill = (projectId, groupId, member, skillName) => {
    if (!authUser) { setStatusMessage('Sign in to report skills.'); return; }
    const reporter = authUser.email || authUser.name || 'unknown';

    // Find the approved skill submission matching the student and skill
    setSkillSubmissions((prev) => {
      const next = prev.map((s) => ({ ...s }));
      const matchIndex = next.findIndex((s) =>
        s.skillName === skillName && s.status === SKILL_STATUS.approved &&
        (s.studentEmail === (member.id && member.id.startsWith('s_') ? member.id.slice(2) : undefined) || s.studentName === member.name)
      );
      if (matchIndex === -1) {
        setStatusMessage('Approved skill record not found for that student.');
        return prev;
      }

      const submission = next[matchIndex];
      submission.reports = Array.isArray(submission.reports) ? submission.reports : [];
      if (submission.reports.includes(reporter)) {
        setStatusMessage('You already reported this skill.');
        return next;
      }
      submission.reports.push(reporter);

      if (!submission.penaltyApplied && submission.reports.length >= 2) {
        // Apply penalty and lock the skill for 30 days
        submission.penaltyApplied = true;
        submission.lockedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // Also add a simpler penalty record on registered users (if available)
        setRegisteredUsers((users) => users.map((u) => {
          if (u.email && submission.studentEmail && u.email === submission.studentEmail) {
            return { ...u, ratingPenalty: (u.ratingPenalty || 0) + 10 };
          }
          if (!u.email && u.name === submission.studentName) {
            return { ...u, ratingPenalty: (u.ratingPenalty || 0) + 10 };
          }
          return u;
        }));

        setStatusMessage(`Penalty applied: ${submission.studentName || submission.studentEmail} -10 rating and skill locked for 30 days.`);
      } else {
        setStatusMessage('Report registered. Awaiting additional reports to apply penalty.');
      }

      next[matchIndex] = submission;
      return next;
    });
  };

  const handleValidateSkill = (projectId, groupId, member, skillName) => {
    if (!authUser) { setStatusMessage('Sign in to validate skills.'); return; }
    const validator = authUser.email || authUser.name || 'unknown';

    let promoted = false;

    setSkillSubmissions((prev) => {
      const next = prev.map((s) => ({ ...s }));
      const studentId = member.id && member.id.startsWith('s_') ? member.id.slice(2) : undefined;
      const matchIndex = next.findIndex((s) => s.skillName === skillName && s.status === SKILL_STATUS.approved && (s.studentEmail === studentId || s.studentName === member.name));
      if (matchIndex === -1) {
        // no submission found; still record as a lightweight validation on member via projects below
        setStatusMessage('Validation noted (no approved record exists).');
        return prev;
      }
      const submission = next[matchIndex];
      submission.validations = Array.isArray(submission.validations) ? submission.validations : [];
      if (submission.validations.includes(validator)) {
        setStatusMessage('You already validated this skill.');
        return next;
      }
      submission.validations.push(validator);

      if (submission.validations.length >= 2 && !submission.promotedAt) {
        // promote member's skill level by 1 (max 5)
        promoted = true;
        submission.promotedAt = new Date().toISOString();
      }

      next[matchIndex] = submission;
      return next;
    });

    if (promoted) {
      // apply promotion to project member skill level
      setProjects((prevProjects) => prevProjects.map((project) => {
        if (project.id !== projectId) return project;
        const updatedGroups = (project.groups || []).map((g) => {
          if (g.id !== groupId) return g;
          const updatedMembers = (g.members || []).map((m) => {
            if (m.id !== member.id) return m;
            const current = Number(m.skills?.[skillName]) || 0;
            const nextLevel = Math.min(5, current + 1);
            return { ...m, skills: { ...(m.skills || {}), [skillName]: nextLevel } };
          });
          return { ...g, members: updatedMembers };
        });
        return { ...project, groups: updatedGroups };
      }));
      setStatusMessage(`${member.name}'s ${skillName} promoted by 1 rank.`);
    }
  };

  const getEffectiveRatingForStudent = (member) => {
    // Components for rating formula:
    // Rating = 0.5(Skill Score) + 0.2(Peer Validation) + 0.2(Project Performance) + 0.1(Contribution Score)
    const studentIdentifier = member.id && member.id.startsWith('s_') ? member.id.slice(2) : member.name;

    // Skill score: prefer using explicit skill levels if available, else fallback to approved submissions
    let skillScore = 0;
    if (member.skills && Object.keys(member.skills).length > 0) {
      skillScore = calculateStudentRatingFromLevels(member.skills);
    } else {
      const approved = skillSubmissions.filter((s) => s.status === SKILL_STATUS.approved && (s.studentEmail === studentIdentifier || s.studentName === member.name));
      skillScore = calculateStudentRating(approved);
    }

    // Peer validation: count validations across approved submissions for this student.
    // Normalize assuming 2 validations per skill gives full credit (100%).
    const approvedSubs = skillSubmissions.filter((s) => s.status === SKILL_STATUS.approved && (s.studentEmail === studentIdentifier || s.studentName === member.name));
    const totalValidations = approvedSubs.reduce((sum, s) => sum + (Array.isArray(s.validations) ? s.validations.length : 0), 0);
    const possibleValidations = Math.max(1, approvedSubs.length * 2); // avoid division by zero
    const peerValidation = Math.min(100, Math.round((totalValidations / possibleValidations) * 100));

    // Project performance and contribution score: read from member object or registered user record if present. Expect 0-100.
    const reg = registeredUsers.find((u) => (u.email && studentIdentifier && `s_${u.email}` === member.id) || u.name === member.name);
    const projectPerformance = (member.projectPerformance !== undefined ? Number(member.projectPerformance) : (reg ? (reg.projectPerformance || 0) : 0)) || 0;
    const contributionScore = (member.contributionScore !== undefined ? Number(member.contributionScore) : (reg ? (reg.contributionScore || 0) : 0)) || 0;

    // Apply weighted formula
    const raw = 0.5 * Number(skillScore || 0) + 0.2 * Number(peerValidation || 0) + 0.2 * Number(projectPerformance || 0) + 0.1 * Number(contributionScore || 0);

    // Apply any registered penalties (e.g., from reports)
    const regPenalty = reg ? (reg.ratingPenalty || 0) : 0;
    const finalScore = Math.max(0, Math.round(raw - regPenalty));
    return finalScore;
  };

  const handleClearGroupSetup = () => {
    setShowGroupSetup(false);
    setCreatedGroups([]);
    setSelectedPreferredSkills([]);
    setGroupTeamSize(2);
    setNewCustomSkill('');
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
        <div className={`nav-links ${authUser && (authUser.role === 'lecturer' || authUser.role === 'student' || authUser.role === 'admin') ? 'nav-lecturer' : ''}`}>
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

                      <div className="detail-item">
                        <div className="detail-icon">⭐</div>
                        <div className="detail-info">
                          <div className="detail-label">Student Rating</div>
                          <div className="detail-value">{getEffectiveRatingForStudent({ id: authUser.email ? `s_${authUser.email}` : undefined, name: authUser.name })}%</div>
                        </div>
                      </div>

                      <div className="detail-item">
                        <div className="detail-icon">🏆</div>
                        <div className="detail-info">
                          <div className="detail-label">Approved Skills</div>
                          <div className="detail-value">{myApprovedSkills.length}</div>
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
                      const studentId = authUser.email ? `s_${authUser.email}` : `s_${Date.now()}`;
                      if ((proj.students || []).some((student) => student.id === studentId || student.name === name)) {
                        setStatusMessage(`You are already joined to ${proj.name}.`);
                        return;
                      }
                      const newStudent = { id: studentId, name: name || 'Student', skills: {} };
                      setProjects(projects.map(p => p.id === proj.id ? { ...p, students: [...(p.students||[]), newStudent] } : p));
                      setStatusMessage(`Joined ${proj.name} as ${newStudent.name}`);
                      setStudentJoinCode(''); setStudentJoinName(''); setShowStudentJoin(false);
                      setActiveStudentProjectId(proj.id);
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

              {activeStudentProject ? (
                <div className="student-project-detail">
                  <div className="student-project-header">
                    <button className="btn-cancel" onClick={() => setActiveStudentProjectId(null)}>← Back to projects</button>
                    <div>
                      <h3>{activeStudentProject.name}</h3>
                      <p>{activeStudentProject.description}</p>
                    </div>
                  </div>

                  {activeStudentProject.groups && activeStudentProject.groups.length > 0 ? (
                    <div className="student-group-list">
                      {activeStudentProject.groups.map((group, index) => {
                        const isMyGroup = currentStudentId && group.members.some((member) => member.id === currentStudentId);
                        const leaderNames = (group.leaderIds || [])
                          .map((leaderId) => group.members.find((m) => m.id === leaderId)?.name || 'Unknown')
                          .join(', ');
                        const hasVoted = Boolean(currentStudentId && group.votes?.[currentStudentId]);
                        const candidateIds = group.candidateIds?.length ? group.candidateIds : group.members.map((member) => member.id);

                        return (
                          <div key={group.id} className={`group-card ${isMyGroup ? 'my-group' : ''}`}>
                            <div className="group-card-header">
                              <div>
                                <span className="group-title">Team {index + 1}</span>
                                <span className="group-meta">{group.members.length} members</span>
                              </div>
                              <span className={`group-status group-status-${group.voteStatus || 'pending'}`}>
                                {group.voteStatus === 'selected' ? 'Leader selected' : group.voteStatus === 'runoff' ? 'Runoff' : 'Voting open'}
                              </span>
                            </div>

                            {leaderNames && (
                              <div className="leader-badge">Leader: {leaderNames}</div>
                            )}

                            <div className="group-card-members">
                              {group.members.map((member) => (
                                <div key={member.id} className="group-member-row">
                                  <div style={{display:'flex', justifyContent:'space-between', width:'100%'}}>
                                    <div>
                                      <strong>{member.name}</strong>
                                    </div>
                                    <div>{getEffectiveRatingForStudent(member)}%</div>
                                  </div>
                                  <div className="member-skills">
                                    {Object.entries(member.skills || {}).length === 0 && (
                                      <div className="skill-item">No skills</div>
                                    )}
                                    {Object.entries(member.skills || {}).map(([skillName, level]) => (
                                      <div key={skillName} className="skill-item">
                                        <span>{skillName} ({level})</span>
                                        {((authUser.role === 'lecturer' || authUser.role === 'admin' || isMyGroup) && currentStudentId !== member.id) && (
                                          <>
                                            <button className="btn-report" onClick={() => handleReportFakeSkill(activeStudentProject.id, group.id, member, skillName)}>Report</button>
                                            <button className="btn-validate" onClick={() => handleValidateSkill(activeStudentProject.id, group.id, member, skillName)}>Validate</button>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {isMyGroup && (
                              <div className="group-vote-panel">
                                <div className="group-vote-intro">
                                  <strong>Vote for your team leader</strong>
                                  <span>{group.voteRound === 2 ? 'Runoff round — choose from tied candidates.' : 'Each team member gets one vote.'}</span>
                                </div>

                                {group.voteStatus === 'selected' ? (
                                  <div className="vote-result">Final leader: {leaderNames}</div>
                                ) : (
                                  <>
                                    <div className="vote-count">
                                      {Object.keys(group.votes || {}).length} / {group.members.length} votes cast
                                    </div>

                                    <div className="group-vote-actions">
                                      {candidateIds.map((candidateId) => {
                                        const candidate = group.members.find((member) => member.id === candidateId);
                                        if (!candidate) return null;
                                        const disabled = hasVoted || group.voteStatus === 'selected';
                                        return (
                                          <button
                                            key={candidateId}
                                            type="button"
                                            className="vote-button"
                                            onClick={() => handleVoteLeader(activeStudentProject.id, group.id, candidate.id)}
                                            disabled={disabled}
                                          >
                                            {candidate.name}
                                          </button>
                                        );
                                      })}
                                    </div>

                                    {hasVoted && (
                                      <div className="vote-note">Thanks! Your vote is recorded. Waiting for teammates.</div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {/* Tasks panel */}
                            {isMyGroup && (
                              <div className="group-tasks-panel">
                                <h5>Team Tasks</h5>
                                {(group.tasks || []).length === 0 && (
                                  <div className="empty-state">No tasks assigned yet.</div>
                                )}

                                {(group.tasks || []).map((task) => {
                                  const assignee = group.members.find((m) => m.id === task.assigneeId);
                                  const isAssignee = currentStudentId && task.assigneeId === currentStudentId;
                                  const isLeader = currentStudentId && (group.leaderIds || []).includes(currentStudentId);
                                  const alreadyConfirmed = task.confirmations && task.confirmations[currentStudentId];
                                  return (
                                    <div key={task.id} className="task-row">
                                      <div className="task-title">{task.title}</div>
                                      <div className="task-meta">Assigned to: {assignee ? assignee.name : 'Unknown'}</div>
                                      <div className="task-status">Status: {task.status}</div>
                                      <div className="task-actions">
                                        {isAssignee && task.status === 'assigned' && (
                                          <button className="btn-submit" onClick={() => handleMarkTaskDone(activeStudentProject.id, group.id, task.id)}>Mark Complete</button>
                                        )}

                                        {task.status === 'completed' && !isAssignee && !alreadyConfirmed && (
                                          <button className="btn-submit" onClick={() => handleConfirmTask(activeStudentProject.id, group.id, task.id)}>Confirm</button>
                                        )}

                                        {task.status === 'confirmed' && (
                                          <span className="confirmed-badge">Confirmed</span>
                                        )}
                                      </div>
                                      <div className="task-confirm-count">Confirmations: {Object.keys(task.confirmations || {}).length} / {Math.max(0, group.members.length - 1)}</div>
                                    </div>
                                  );
                                })}

                                {/* Leader task creation form */}
                                {(group.leaderIds || []).includes(currentStudentId) && (
                                  <div className="task-create-form">
                                    <input placeholder="Task title" id={`task_input_${group.id}`} />
                                    <select id={`task_assignee_${group.id}`}>
                                      <option value="">Select assignee</option>
                                      {group.members.map((m) => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                      ))}
                                    </select>
                                    <button
                                      className="btn-submit"
                                      onClick={() => {
                                        const titleEl = document.getElementById(`task_input_${group.id}`);
                                        const assEl = document.getElementById(`task_assignee_${group.id}`);
                                        const title = titleEl ? titleEl.value.trim() : '';
                                        const assignee = assEl ? assEl.value : '';
                                        if (!title || !assignee) { setStatusMessage('Provide task title and assignee'); return; }
                                        handleCreateTask(activeStudentProject.id, group.id, title, assignee);
                                        if (titleEl) titleEl.value = '';
                                        if (assEl) assEl.value = '';
                                      }}
                                    >Assign Task</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="empty-state">
                      No groups have been created for this project yet.
                    </div>
                  )}
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
                          <button className="btn-project-action" onClick={() => setActiveStudentProjectId(project.id)}>View Teams</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {studentTab === 'skills' && (
            <section id="skills" className="skills-section">
              <div className="skills-header">
                <h2>My Skills</h2>
                <div className="skills-header-right">
                  <div className="student-rating-display">
                    <span className="rating-label">Student Rating</span>
                    <span className="rating-value">{getEffectiveRatingForStudent({ id: currentStudentId, name: authUser.name })}%</span>
                  </div>
                  <button className="btn-add-skill" onClick={() => setShowAddSkill(!showAddSkill)}>
                    <span>+ Add Skill</span>
                  </button>
                </div>
              </div>

              {statusMessage && <div className="status-alert">{statusMessage}</div>}

              {showAddSkill && (
                <div className="skill-submit-form-container">
                  <div className="skill-submit-form">
                    <h3>Submit a New Skill</h3>
                    <form onSubmit={handleSubmitSkill}>
                      <label>
                        Skill Name
                        <input
                          type="text"
                          placeholder="e.g. React, Python, Data Analysis..."
                          value={newSkillName}
                          onChange={(e) => setNewSkillName(e.target.value)}
                          required
                        />
                      </label>
                      <label>
                        Description (optional)
                        <input
                          type="text"
                          placeholder="Brief description of your proficiency..."
                          value={newSkillDescription}
                          onChange={(e) => setNewSkillDescription(e.target.value)}
                        />
                      </label>
                      <div className="form-actions">
                        <button type="submit" className="btn-submit">Submit for Approval</button>
                        <button type="button" className="btn-cancel" onClick={() => setShowAddSkill(false)}>Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {myApprovedSkills.length > 0 && (
                <div className="skills-category">
                  <h3>Approved Skills</h3>
                  <div className="skill-cards-grid">
                    {myApprovedSkills.map((skill) => {
                      const tierInfo = getSkillTierBadge(skill.tier);
                      return (
                        <div key={skill.id} className={`skill-card skill-card-${skill.tier}`}>
                          <div className="skill-card-glow"></div>
                          <div className="skill-card-inner">
                            <div className="skill-card-tier-badge" style={{ background: tierInfo.color }}>
                              {tierInfo.label}
                            </div>
                            <h4 className="skill-card-title">{skill.skillName}</h4>
                            {skill.description && <p className="skill-card-desc">{skill.description}</p>}
                            <div className="skill-card-weight">Weight: {tierInfo.weight}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {myPendingSkills.length > 0 && (
                <div className="skills-category">
                  <h3>Pending Approval</h3>
                  <div className="skill-cards-grid">
                    {myPendingSkills.map((skill) => (
                      <div key={skill.id} className="skill-card skill-card-pending">
                        <div className="skill-card-inner">
                          <div className="skill-card-tier-badge skill-badge-pending">Pending</div>
                          <h4 className="skill-card-title">{skill.skillName}</h4>
                          {skill.description && <p className="skill-card-desc">{skill.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myRejectedSkills.length > 0 && (
                <div className="skills-category">
                  <h3>Rejected</h3>
                  <div className="skill-cards-grid">
                    {myRejectedSkills.map((skill) => (
                      <div key={skill.id} className="skill-card skill-card-rejected">
                        <div className="skill-card-inner">
                          <div className="skill-card-tier-badge skill-badge-rejected">Rejected</div>
                          <h4 className="skill-card-title">{skill.skillName}</h4>
                          {skill.description && <p className="skill-card-desc">{skill.description}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {myApprovedSkills.length === 0 && myPendingSkills.length === 0 && myRejectedSkills.length === 0 && (
                <p className="empty-state">No skills submitted yet. Click "+ Add Skill" to submit your first skill!</p>
              )}
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
                                    {(authUser && (authUser.role === 'lecturer' || authUser.role === 'admin')) && (
                                      <>
                                        <button className="btn-report" onClick={() => handleReportFakeSkill(selectedProject.id, null, s, skill)}>Report</button>
                                        <button className="btn-validate" onClick={() => handleValidateSkill(selectedProject.id, null, s, skill)}>Validate</button>
                                      </>
                                    )}
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

                    <div className="group-setup-panel">
                      <div className="group-setup-header">
                        <h4>Group Setup</h4>
                        <p>Pick team size and preferred skills to balance the strongest students across diverse teams.</p>
                      </div>

                      <div className="group-setup-controls">
                        <label>
                          Team Size
                          <input
                            type="number"
                            min="1"
                            value={groupTeamSize}
                            onChange={(e) => setGroupTeamSize(Number(e.target.value))}
                          />
                        </label>

                        <div className="preferred-skills-list">
                          <span className="preferred-label">Preferred Skills</span>
                          <div className="preferred-skills-grid">
                            {allApprovedSkillNames.map((skill) => (
                              <button
                                key={skill}
                                type="button"
                                className={`skill-pill ${selectedPreferredSkills.includes(skill) ? 'selected' : ''}`}
                                onClick={() => handleTogglePreferredSkill(skill)}
                                draggable
                                onDragStart={(event) => handleDragStartSkill(event, skill)}
                              >
                                {skill}
                              </button>
                            ))}
                          </div>
                          <div
                            className="preferred-skill-dropzone"
                            onDragOver={handleAllowDrop}
                            onDrop={handleDropPreferredSkill}
                          >
                            Drag a skill here to select it
                          </div>
                        </div>

                        <div className="custom-skill-row">
                          <input
                            type="text"
                            placeholder="Add custom skill"
                            value={newCustomSkill}
                            onChange={(e) => setNewCustomSkill(e.target.value)}
                          />
                          <button type="button" className="btn-submit" onClick={handleCreateCustomSkill}>Add Skill</button>
                        </div>

                        {selectedPreferredSkills.length > 0 && (
                          <div className="selected-skills-summary">
                            <span>Selected Skills:</span>
                            <div className="selected-skills-grid">
                              {selectedPreferredSkills.map((skill) => (
                                <button
                                  key={skill}
                                  type="button"
                                  className="skill-pill selected"
                                  onClick={() => handleTogglePreferredSkill(skill)}
                                >
                                  {skill} ×
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="group-setup-actions">
                          <button type="button" className="btn-submit" onClick={handleCreateGroups}>Create Groups</button>
                          <button type="button" className="btn-cancel" onClick={handleClearGroupSetup}>Reset</button>
                        </div>
                      </div>

                      {showGroupSetup && createdGroups.length > 0 && (
                        <div className="created-groups-list">
                          <h4>Created Groups</h4>
                          {createdGroups.map((group) => (
                            <div key={group.id} className="group-card">
                              <div className="group-card-header">
                                <span>Team {group.id.split('_').pop()}</span>
                                <span>{group.members.length} members</span>
                              </div>
                              <div className="group-card-skills">
                                {group.skillNames.length > 0 ? group.skillNames.join(', ') : 'No skills yet'}
                              </div>
                              <div className="group-card-members">
                                {group.members.map((member) => (
                                  <div key={member.id} className="group-member-row">
                                    <span>{member.name}</span>
                                    <span>{member.rating}%</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
              <h2>Skills Overview</h2>
              {allApproved.length > 0 ? (
                <div className="skill-cards-grid">
                  {allApproved.map((skill) => {
                    const tierInfo = getSkillTierBadge(skill.tier);
                    return (
                      <div key={skill.id} className={`skill-card skill-card-${skill.tier}`}>
                        <div className="skill-card-glow"></div>
                        <div className="skill-card-inner">
                          <div className="skill-card-tier-badge" style={{ background: tierInfo.color }}>
                            {tierInfo.label}
                          </div>
                          <h4 className="skill-card-title">{skill.skillName}</h4>
                          {skill.description && <p className="skill-card-desc">{skill.description}</p>}
                          <div className="skill-card-student">{skill.studentName}</div>
                          <div className="skill-card-weight">Weight: {tierInfo.weight}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="empty-state">No approved skills yet.</p>
              )}
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

      {/* Admin portal */}
      {authUser && authUser.role === 'admin' && (
        <>
          <nav className="admin-sub-nav">
            <button
              className={`nav-action ${adminTab === 'skills' ? 'selected' : ''}`}
              type="button"
              onClick={() => setAdminTab('skills')}
            >
              <span className="nav-label">Skill Approvals {pendingForAdmin.length > 0 && <span className="pending-count">{pendingForAdmin.length}</span>}</span>
            </button>
            <button
              className={`nav-action ${adminTab === 'all-skills' ? 'selected' : ''}`}
              type="button"
              onClick={() => setAdminTab('all-skills')}
            >
              <span className="nav-label">All Approved Skills</span>
            </button>
            <button
              className={`nav-action ${adminTab === 'students' ? 'selected' : ''}`}
              type="button"
              onClick={() => setAdminTab('students')}
            >
              <span className="nav-label">Students</span>
            </button>
            <button
              className={`nav-action ${adminTab === 'lecturers' ? 'selected' : ''}`}
              type="button"
              onClick={() => setAdminTab('lecturers')}
            >
              <span className="nav-label">Lecturers</span>
            </button>
          </nav>

          {adminTab === 'skills' && (
            <section className="admin-section">
              <h2>Pending Skill Approvals</h2>
              {statusMessage && <div className="status-alert">{statusMessage}</div>}

              {pendingForAdmin.length === 0 ? (
                <p className="empty-state">No pending skill submissions.</p>
              ) : (
                <div className="admin-skills-list">
                  {pendingForAdmin.map((skill) => (
                    <div key={skill.id} className="admin-skill-card">
                      <div className="admin-skill-card-inner">
                        <div className="admin-skill-info">
                          <h3 className="admin-skill-name">{skill.skillName}</h3>
                          {skill.description && (
                            <p className="admin-skill-desc">{skill.description}</p>
                          )}
                          <div className="admin-skill-meta">
                            <span>Submitted by: <strong>{skill.studentName}</strong></span>
                            <span>{skill.studentEmail}</span>
                          </div>
                        </div>
                        <div className="admin-skill-actions">
                          <span className="tier-label">Assign tier & approve:</span>
                          <div className="tier-buttons">
                            {Object.entries(SKILL_TIERS).map(([key, config]) => (
                              <button
                                key={key}
                                className={`btn-tier btn-tier-${key}`}
                                style={{ borderColor: config.color, color: config.color }}
                                onClick={() => handleApproveSkill(skill.id, key)}
                              >
                                {config.label}
                              </button>
                            ))}
                          </div>
                          <button
                            className="btn-reject"
                            onClick={() => handleRejectSkill(skill.id)}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {adminTab === 'all-skills' && (
            <section className="admin-section">
              <h2>All Approved Skills</h2>
              {allApproved.length === 0 ? (
                <p className="empty-state">No skills have been approved yet.</p>
              ) : (
                <div className="skill-cards-grid">
                  {allApproved.map((skill) => {
                    const tierInfo = getSkillTierBadge(skill.tier);
                    return (
                      <div key={skill.id} className={`skill-card skill-card-${skill.tier}`}>
                        <div className="skill-card-glow"></div>
                        <div className="skill-card-inner">
                          <div className="skill-card-tier-badge" style={{ background: tierInfo.color }}>
                            {tierInfo.label}
                          </div>
                          <h4 className="skill-card-title">{skill.skillName}</h4>
                          <div className="skill-card-student">{skill.studentName}</div>
                          <div className="skill-card-weight">Weight: {tierInfo.weight}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {adminTab === 'students' && (
            <section className="admin-section">
              <h2>Registered Students</h2>
              {registeredStudents.length === 0 ? (
                <p className="empty-state">No students have registered yet.</p>
              ) : (
                <div className="admin-users-grid">
                  {registeredStudents.map((user) => {
                    const userApproved = skillSubmissions.filter(
                      (s) => s.studentEmail === user.email && s.status === SKILL_STATUS.approved
                    );
                    const rating = calculateStudentRating(userApproved);
                    return (
                      <div key={user.email} className="admin-user-card">
                        <div className="admin-user-card-inner">
                          <div className="admin-user-avatar">{getProfileInitials(user.name || user.email)}</div>
                          <h4 className="admin-user-name">{user.name || user.email}</h4>
                          <div className="admin-user-detail"><span className="detail-lbl">Email</span> {user.email}</div>
                          {user.major && <div className="admin-user-detail"><span className="detail-lbl">Major</span> {user.major}</div>}
                          <div className="admin-user-detail"><span className="detail-lbl">Rating</span> <span className="rating-value-small">{rating}%</span></div>
                          <div className="admin-user-detail"><span className="detail-lbl">Approved Skills</span> {userApproved.length}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {adminTab === 'lecturers' && (
            <section className="admin-section">
              <h2>Registered Lecturers</h2>
              {registeredLecturers.length === 0 ? (
                <p className="empty-state">No lecturers have registered yet.</p>
              ) : (
                <div className="admin-users-grid">
                  {registeredLecturers.map((user) => (
                    <div key={user.email} className="admin-user-card">
                      <div className="admin-user-card-inner">
                        <div className="admin-user-avatar">{getProfileInitials(user.name || user.email)}</div>
                        <h4 className="admin-user-name">{user.name || user.email}</h4>
                        <div className="admin-user-detail"><span className="detail-lbl">Email</span> {user.email}</div>
                        {user.department && <div className="admin-user-detail"><span className="detail-lbl">Department</span> {user.department}</div>}
                        <div className="admin-user-detail"><span className="detail-lbl">Role</span> Lecturer</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default App;
