import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('tabConfig', () => {
  it('contains login and register tabs', () => {
    expect(tabConfig).toEqual([
      { key: 'login', label: 'Login' },
      { key: 'register', label: 'Register' },
    ]);
  });

  it('has exactly two entries', () => {
    expect(tabConfig).toHaveLength(2);
  });
});

describe('defaultProjects', () => {
  it('contains three default projects', () => {
    expect(defaultProjects).toHaveLength(3);
  });

  it('has correct structure for each project', () => {
    for (const project of defaultProjects) {
      expect(project).toHaveProperty('id');
      expect(project).toHaveProperty('name');
      expect(project).toHaveProperty('code');
      expect(project).toHaveProperty('description');
      expect(project).toHaveProperty('status');
      expect(project).toHaveProperty('archived');
      expect(project).toHaveProperty('students');
      expect(Array.isArray(project.students)).toBe(true);
    }
  });

  it('has one archived project', () => {
    const archived = defaultProjects.filter((p) => p.archived);
    expect(archived).toHaveLength(1);
    expect(archived[0].name).toBe('Mobile App Development');
  });

  it('has two ongoing projects', () => {
    const ongoing = defaultProjects.filter((p) => !p.archived);
    expect(ongoing).toHaveLength(2);
  });

  it('students have id, name, and skills', () => {
    for (const project of defaultProjects) {
      for (const student of project.students) {
        expect(student).toHaveProperty('id');
        expect(student).toHaveProperty('name');
        expect(student).toHaveProperty('skills');
        expect(typeof student.skills).toBe('object');
      }
    }
  });
});

describe('generateProjectCode', () => {
  it('returns an 8-character string', () => {
    const code = generateProjectCode();
    expect(code).toHaveLength(8);
  });

  it('contains only uppercase letters and digits', () => {
    const code = generateProjectCode();
    expect(code).toMatch(/^[A-Z0-9]{8}$/);
  });

  it('generates different codes on successive calls', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateProjectCode()));
    expect(codes.size).toBeGreaterThan(1);
  });
});

describe('buildUserFromPayload', () => {
  it('creates an admin user when isAdmin is true', () => {
    const payload = { email: 'admin@school.edu', name: 'Admin' };
    const user = buildUserFromPayload(payload, true, 'student');
    expect(user).toEqual({
      role: 'admin',
      email: 'admin@school.edu',
      name: 'Admin',
    });
  });

  it('creates a student user', () => {
    const payload = { email: 'student@school.edu', name: 'Maya Kim' };
    const user = buildUserFromPayload(payload, false, 'student');
    expect(user).toEqual({
      role: 'student',
      email: 'student@school.edu',
      name: 'Maya Kim',
    });
  });

  it('creates a lecturer user', () => {
    const payload = { email: 'prof@school.edu', name: 'Dr. Park' };
    const user = buildUserFromPayload(payload, false, 'lecturer');
    expect(user).toEqual({
      role: 'lecturer',
      email: 'prof@school.edu',
      name: 'Dr. Park',
    });
  });

  it('falls back to email prefix when name is missing', () => {
    const payload = { email: 'alice@school.edu' };
    const user = buildUserFromPayload(payload, false, 'student');
    expect(user.name).toBe('alice');
  });

  it('returns empty name when both name and email are missing', () => {
    const payload = {};
    const user = buildUserFromPayload(payload, false, 'student');
    expect(user.name).toBe('');
  });
});

describe('buildStatusMessage', () => {
  it('returns admin login message', () => {
    const user = { role: 'admin', name: 'Admin' };
    expect(buildStatusMessage(user, true, false)).toBe(
      'admin login successful for Admin.'
    );
  });

  it('returns registration message', () => {
    const user = { role: 'student', name: 'Maya' };
    expect(buildStatusMessage(user, false, true)).toBe(
      'student registration successful for Maya.'
    );
  });

  it('returns login message for regular user', () => {
    const user = { role: 'lecturer', name: 'Dr. Park' };
    expect(buildStatusMessage(user, false, false)).toBe(
      'lecturer login successful for Dr. Park.'
    );
  });

  it('falls back to email when name is empty', () => {
    const user = { role: 'student', name: '', email: 'student@school.edu' };
    expect(buildStatusMessage(user, false, false)).toBe(
      'student login successful for student@school.edu.'
    );
  });
});

describe('getProfileInitials', () => {
  it('returns first two characters uppercased for single word', () => {
    expect(getProfileInitials('Maya')).toBe('MA');
  });

  it('returns first two characters of first word for multi-word name', () => {
    expect(getProfileInitials('Maya Kim')).toBe('MA');
  });

  it('handles single character names', () => {
    expect(getProfileInitials('A')).toBe('A');
  });

  it('returns "U" uppercased for empty string', () => {
    expect(getProfileInitials('')).toBe('U');
  });

  it('returns "U" for null/undefined', () => {
    expect(getProfileInitials(null)).toBe('U');
    expect(getProfileInitials(undefined)).toBe('U');
  });

  it('handles email addresses', () => {
    expect(getProfileInitials('alice@school.edu')).toBe('AL');
  });
});

describe('getBrandText', () => {
  it('returns "Lecturer Portal" for lecturer', () => {
    expect(getBrandText({ role: 'lecturer' })).toBe('Lecturer Portal');
  });

  it('returns "Student Portal" for student', () => {
    expect(getBrandText({ role: 'student' })).toBe('Student Portal');
  });

  it('returns "Bottlenecks" when no user', () => {
    expect(getBrandText(null)).toBe('Bottlenecks');
  });

  it('returns "Bottlenecks" for admin role', () => {
    expect(getBrandText({ role: 'admin' })).toBe('Bottlenecks');
  });
});

describe('getActionLabel', () => {
  it('returns "Sign in as Admin" for admin', () => {
    expect(getActionLabel(true, false)).toBe('Sign in as Admin');
  });

  it('returns "Create account" for register', () => {
    expect(getActionLabel(false, true)).toBe('Create account');
  });

  it('returns "Log in" for regular login', () => {
    expect(getActionLabel(false, false)).toBe('Log in');
  });
});

describe('getRoleLabel', () => {
  it('returns "Admin" for admin', () => {
    expect(getRoleLabel(true, 'student')).toBe('Admin');
  });

  it('returns "Student" for student role', () => {
    expect(getRoleLabel(false, 'student')).toBe('Student');
  });

  it('returns "Lecturer" for lecturer role', () => {
    expect(getRoleLabel(false, 'lecturer')).toBe('Lecturer');
  });
});

describe('loadAuthUser', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no user is stored', () => {
    expect(loadAuthUser()).toBeNull();
  });

  it('returns parsed user from localStorage', () => {
    const user = { role: 'student', email: 'test@test.com', name: 'Test' };
    localStorage.setItem('authUser', JSON.stringify(user));
    expect(loadAuthUser()).toEqual(user);
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('authUser', 'not-json');
    expect(loadAuthUser()).toBeNull();
  });

  it('returns null for stored "null"', () => {
    localStorage.setItem('authUser', 'null');
    expect(loadAuthUser()).toBeNull();
  });
});
