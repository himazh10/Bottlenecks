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
    status: 'ongoing',
    archived: false,
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

export const calculateStudentRating = (data) => {
  let approvedSkills = [];
  let peerValidation = 0;
  let projectPerformance = 0;
  let contributionScore = 0;

  if (Array.isArray(data)) {
    approvedSkills = data;
  } else if (data && typeof data === 'object') {
    approvedSkills = data.approvedSkills || [];
    peerValidation = data.peerValidation || 0;
    projectPerformance = data.projectPerformance || 0;
    contributionScore = data.contributionScore || 0;
  }

  let skillScore = 0;
  if (approvedSkills && approvedSkills.length > 0) {
    const totalWeight = approvedSkills.reduce((sum, skill) => {
      const tier = SKILL_TIERS[skill.tier];
      return sum + (tier ? tier.weight : 0);
    }, 0);
    const maxPossible = approvedSkills.length * SKILL_TIERS.diamond.weight;
    skillScore = (totalWeight / maxPossible) * 100;
  }

  const rating = (0.5 * skillScore) + 
                 (0.2 * peerValidation) + 
                 (0.2 * projectPerformance) + 
                 (0.1 * contributionScore);

  return Math.round(rating * 10) / 10;
};

export const getSkillTierBadge = (tier) => {
  const config = SKILL_TIERS[tier];
  if (!config) return { label: 'Unknown', color: '#555' };
  return config;
};

export const hasPreferredSkill = (student, preferredSkills) => {
  if (!student.skills || !preferredSkills || preferredSkills.length === 0) return false;
  return Object.keys(student.skills).some(skill => preferredSkills.includes(skill));
};

export const generateStudentGroups = (students, groupSize, preferredSkills) => {
  if (!students || students.length === 0) return [];
  if (groupSize <= 0) return [];

  // We need to use the actual approved skills to calculate rating
  // Since students in projects might only have 'skills' object (from defaultProjects) 
  // or they might have 'approvedSkills' (from the rest of the app).
  // We'll try to handle both.
  const studentsWithRating = students.map(s => {
    const skillsForRating = s.approvedSkills || s.skills || [];
    // If skills is an object (like in defaultProjects), convert it to array of {skillName, tier}
    // but since we don't have tiers there, we'll just treat them as common.
    let skillsArray = [];
    if (Array.isArray(skillsForRating)) {
      skillsArray = skillsForRating;
    } else if (typeof skillsForRating === 'object') {
      skillsArray = Object.entries(skillsForRating).map(([name, level]) => ({
        skillName: name,
        tier: 'common',
        level: level
      }));
    }
    return {
      ...s,
      _rating: calculateStudentRating(skillsArray)
    };
  }).sort((a, b) => b._rating - a._rating);

  const availableStudents = [...studentsWithRating];
  const groups = [];

  while (availableStudents.length > 0) {
    const currentStudent = availableStudents.shift();
    const currentGroup = [currentStudent];

    while (currentGroup.length < groupSize && availableStudents.length > 0) {
      let targetIndex = availableStudents.length - 1;
      
      if (hasPreferredSkill(availableStudents[targetIndex], preferredSkills)) {
        let found = false;
        for (let i = targetIndex - 1; i >= 0; i--) {
          if (!hasPreferredSkill(availableStudents[i], preferredSkills)) {
            targetIndex = i;
            found = true;
            break;
          }
        }
      }

      currentGroup.push(availableStudents.splice(targetIndex, 1)[0]);
    }
    groups.push(currentGroup);
  }

  return groups;
};
