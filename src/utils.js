export const tabConfig = [
  { key: 'login', label: 'Login' },
  { key: 'register', label: 'Register' },
];

export const defaultProjects = [
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
];

export const generateProjectCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const buildUserFromPayload = (payload, isAdmin, role) => {
  const userRole = isAdmin ? 'admin' : role;
  return {
    role: userRole,
    email: payload.email,
    name: payload.name || (payload.email ? payload.email.split('@')[0] : ''),
  };
};

export const buildStatusMessage = (user, isAdmin, isRegister) => {
  const action = isAdmin ? 'login' : isRegister ? 'registration' : 'login';
  return `${user.role} ${action} successful for ${user.name || user.email}.`;
};

export const getProfileInitials = (nameOrEmail) => {
  return (nameOrEmail || 'U').split(' ')[0].slice(0, 2).toUpperCase();
};

export const getBrandText = (authUser) => {
  if (authUser && authUser.role === 'lecturer') return 'Lecturer Portal';
  if (authUser && authUser.role === 'student') return 'Student Portal';
  return 'Bottlenecks';
};

export const getActionLabel = (isAdmin, isRegister) => {
  if (isAdmin) return 'Sign in as Admin';
  if (isRegister) return 'Create account';
  return 'Log in';
};

export const getRoleLabel = (isAdmin, role) => {
  if (isAdmin) return 'Admin';
  return role === 'student' ? 'Student' : 'Lecturer';
};

export const loadAuthUser = () => {
  try {
    return JSON.parse(localStorage.getItem('authUser')) || null;
  } catch (e) {
    return null;
  }
};
