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

export const getSkillTierBadge = (tier) => {
  const config = SKILL_TIERS[tier];
  if (!config) return { label: 'Unknown', color: '#555' };
  return config;
};

export const calculateStudentRating = (approvedSkills, peerValidationScore, projectPerformanceScore, contributionScore) => {
  // Assuming inputs are normalized 0-100 values
  const skillScore = approvedSkills && approvedSkills.length > 0 ? 
    approvedSkills.reduce((sum, s) => sum + (s.tier === 'diamond' ? 5 : s.tier === 'rare' ? 3 : 1), 0) / (approvedSkills.length * 5) * 100 : 0;
    
  const rating = (0.5 * skillScore) + (0.2 * peerValidationScore) + (0.2 * projectPerformanceScore) + (0.1 * contributionScore);
  
  return Math.round(rating * 10) / 10;
};

export const generateGroups = (students, teamSize, preferredSkills) => {
  // 1. Calculate ratings for each student
  // We assume students have a 'skills' object { skillName: level }
  // We'll use the level as a proxy for rating if skill tier data is unavailable.
  const getRating = (student) => {
    const skills = student.skills || {};
    const levels = Object.values(skills);
    if (levels.length === 0) return 0;
    return levels.reduce((a, b) => a + b, 0) / levels.length;
  };

  const studentsWithRatings = students.map(s => ({ ...s, rating: getRating(s) }));
  
  // 2. Sort by rating descending
  studentsWithRatings.sort((a, b) => b.rating - a.rating);
  
  // 3. Create teams
  const numTeams = Math.ceil(students.length / teamSize);
  const teams = Array.from({ length: numTeams }, () => ({ 
    students: [], 
    rating: 0, 
    leader: null, 
    votes: {}, // { studentId: votedForStudentId }
    runoffCandidates: [] // List of student IDs for runoff if tie occurs
  }));
  
  // 4. Distribute (High-rated student to lowest-rated team)
  studentsWithRatings.forEach(student => {
    teams.sort((a, b) => a.rating - b.rating);
    teams[0].students.push(student);
    teams[0].rating += student.rating;
  });
  
  return teams;
};
