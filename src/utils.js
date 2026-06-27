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
  if (authUser && authUser.role === 'admin') return 'Admin Portal';
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
    if (typeof localStorage === 'undefined') return null;
    return JSON.parse(localStorage.getItem('authUser')) || null;
  } catch (e) {
    return null;
  }
};

export const SKILL_TIERS = {
  common: { label: 'Common', weight: 1, color: '#c0c0c0' },
  rare: { label: 'Rare', weight: 3, color: '#ff4444' },
  diamond: { label: 'Diamond', weight: 5, color: '#9b59b6' },
};

export const SKILL_STATUS = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
};

export const calculateStudentRating = (approvedSkills) => {
  if (!approvedSkills || approvedSkills.length === 0) return 0;
  const totalWeight = approvedSkills.reduce((sum, skill) => {
    const tier = SKILL_TIERS[skill.tier];
    return sum + (tier ? tier.weight : 0);
  }, 0);
  const maxPossible = approvedSkills.length * SKILL_TIERS.diamond.weight;
  const normalized = (totalWeight / maxPossible) * 100;
  return Math.round(normalized * 10) / 10;
};

export const calculateStudentRatingFromLevels = (skills = {}) => {
  const levels = Object.values(skills || {}).map((value) => Number(value) || 0);
  if (levels.length === 0) return 0;
  const total = levels.reduce((sum, level) => sum + level, 0);
  const maxTotal = levels.length * 5;
  return maxTotal === 0 ? 0 : Math.round((total / maxTotal) * 100);
};

export const createStudentGroups = (students, teamSize, preferredSkills = []) => {
  const normalizedStudents = students.map((student) => {
    const skillNames = Object.keys(student.skills || {});
    return {
      ...student,
      rating: calculateStudentRatingFromLevels(student.skills),
      skillNames,
    };
  });

  const groupCount = Math.max(1, Math.ceil(normalizedStudents.length / Math.max(1, teamSize)));
  const groups = Array.from({ length: groupCount }, (_, index) => ({
    id: `group_${Date.now()}_${index}`,
    members: [],
    rating: 0,
    skillNames: [],
    preferredSkills,
    votes: {},
    voteRound: 1,
    voteStatus: 'pending',
    candidateIds: [],
    leaderIds: [],
    tasks: [],
  }));

  const compareGroups = (a, b, student) => {
    const overlapA = student.skillNames.filter((skill) => a.skillNames.includes(skill)).length;
    const overlapB = student.skillNames.filter((skill) => b.skillNames.includes(skill)).length;
    if (overlapA !== overlapB) return overlapA - overlapB;
    if (a.rating !== b.rating) return a.rating - b.rating;
    if (a.members.length !== b.members.length) return a.members.length - b.members.length;
    return a.id.localeCompare(b.id);
  };

  const sortedStudents = [...normalizedStudents].sort((a, b) => b.rating - a.rating);

  for (const student of sortedStudents) {
    const candidateGroups = groups.filter((group) => group.members.length < teamSize);
    if (candidateGroups.length === 0) break;
    candidateGroups.sort((a, b) => compareGroups(a, b, student));
    const target = candidateGroups[0];
    target.members.push(student);
    target.skillNames = Array.from(new Set([...target.skillNames, ...student.skillNames]));
    target.rating = Math.round(target.members.reduce((sum, member) => sum + member.rating, 0) / target.members.length);
  }

  return groups;
};

export const getSkillTierBadge = (tier) => {
  const config = SKILL_TIERS[tier];
  if (!config) return { label: 'Unknown', color: '#555' };
  return config;
};
