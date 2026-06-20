import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';

beforeEach(() => {
  localStorage.clear();
});

function getLoginNavButton() {
  return screen.getByLabelText('Login');
}

function getRegisterNavButton() {
  return screen.getByLabelText('Register');
}

describe('App – unauthenticated landing page', () => {
  it('renders the Bottlenecks brand', () => {
    render(<App />);
    expect(screen.getByText('Bottlenecks')).toBeInTheDocument();
  });

  it('renders the hero headline', () => {
    render(<App />);
    expect(
      screen.getByText('Next-gen student team formation and task allocation.')
    ).toBeInTheDocument();
  });

  it('shows Login and Register nav buttons', () => {
    render(<App />);
    expect(getLoginNavButton()).toBeInTheDocument();
    expect(getRegisterNavButton()).toBeInTheDocument();
  });

  it('shows Features and Vision links', () => {
    render(<App />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Vision')).toBeInTheDocument();
  });

  it('shows Learn more button', () => {
    render(<App />);
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });
});

describe('App – login modal', () => {
  it('opens login modal when Login button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getLoginNavButton());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Login', { selector: '.modal-title' })).toBeInTheDocument();
  });

  it('shows student and lecturer role pills in login modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getLoginNavButton());

    const modal = screen.getByRole('dialog');
    expect(within(modal).getByText('Student')).toBeInTheDocument();
    expect(within(modal).getByText('Lecturer')).toBeInTheDocument();
  });

  it('shows email and password fields', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getLoginNavButton());

    expect(screen.getByPlaceholderText('you@school.edu')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
  });

  it('closes modal when close button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getLoginNavButton());
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Close'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('can switch to register from login modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getLoginNavButton());

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByText('Create account'));

    expect(screen.getByText('Register', { selector: '.modal-title' })).toBeInTheDocument();
  });
});

describe('App – register modal', () => {
  it('opens register modal when Register button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getRegisterNavButton());

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Register', { selector: '.modal-title' })).toBeInTheDocument();
  });

  it('shows student-specific fields for student registration', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getRegisterNavButton());

    expect(screen.getByPlaceholderText('Maya Kim')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Software Engineering')).toBeInTheDocument();
  });

  it('shows lecturer-specific fields after selecting Lecturer role', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getRegisterNavButton());

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByText('Lecturer'));

    expect(screen.getByPlaceholderText('Dr. Alex Park')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Computer Science')).toBeInTheDocument();
  });
});

describe('App – admin login', () => {
  it('opens admin login modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Admin login'));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByText('Admin access only.')).toBeInTheDocument();
  });

  it('does not show role pills in admin login', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByLabelText('Admin login'));

    const modal = screen.getByRole('dialog');
    expect(within(modal).queryByText('Student')).not.toBeInTheDocument();
    expect(within(modal).queryByText('Lecturer')).not.toBeInTheDocument();
  });
});

async function loginAs(role = 'student') {
  const user = userEvent.setup();
  render(<App />);
  await user.click(getLoginNavButton());

  if (role === 'lecturer') {
    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByText('Lecturer'));
  }

  await user.type(screen.getByPlaceholderText('you@school.edu'), `${role}@school.edu`);
  await user.type(screen.getByPlaceholderText('••••••••'), 'password123');

  const modal = screen.getByRole('dialog');
  await user.click(within(modal).getByText('Sign in'));
  return user;
}

describe('App – student login flow', () => {
  it('logs in as student and shows Student Portal', async () => {
    await loginAs('student');
    expect(screen.getByText('Student Portal')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('shows student profile tab by default after login', async () => {
    await loginAs('student');
    expect(screen.getByText('Student Profile', { selector: '.profile-card-title' })).toBeInTheDocument();
  });

  it('persists user in localStorage after login', async () => {
    await loginAs('student');
    const stored = JSON.parse(localStorage.getItem('authUser'));
    expect(stored.email).toBe('student@school.edu');
    expect(stored.role).toBe('student');
  });
});

describe('App – lecturer login flow', () => {
  it('logs in as lecturer and shows Lecturer Portal', async () => {
    await loginAs('lecturer');
    expect(screen.getByText('Lecturer Portal')).toBeInTheDocument();
    expect(screen.getByText('Lecturer Profile', { selector: '.nav-label' })).toBeInTheDocument();
  });
});

describe('App – logout', () => {
  it('logs out and returns to landing page', async () => {
    await loginAs('student');
    expect(screen.getByText('Sign out')).toBeInTheDocument();
    const user = userEvent.setup();
    await user.click(screen.getByText('Sign out'));

    expect(screen.getByText('Bottlenecks')).toBeInTheDocument();
    expect(getLoginNavButton()).toBeInTheDocument();
  });

  it('clears localStorage on logout', async () => {
    await loginAs('student');
    const user = userEvent.setup();
    await user.click(screen.getByText('Sign out'));
    expect(localStorage.getItem('authUser')).toBeNull();
  });
});

describe('App – student navigation tabs', () => {
  it('can switch to Projects tab', async () => {
    const user = await loginAs('student');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    expect(screen.getByText('Join Project')).toBeInTheDocument();
  });

  it('can switch to Skills tab', async () => {
    const user = await loginAs('student');
    await user.click(screen.getByText('Skills', { selector: '.nav-label' }));
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
    expect(screen.getByText('Web Dev')).toBeInTheDocument();
    expect(screen.getByText('Data Science')).toBeInTheDocument();
  });

  it('can switch to Archived Projects tab', async () => {
    const user = await loginAs('student');
    await user.click(screen.getByText('Archived Projects', { selector: '.nav-label' }));
    expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
  });

  it('shows active projects in Projects tab (not archived)', async () => {
    const user = await loginAs('student');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    expect(screen.getByText('Web Development Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('AI Research Initiative')).toBeInTheDocument();
    expect(screen.queryByText('Mobile App Development')).not.toBeInTheDocument();
  });
});

describe('App – student join project', () => {
  async function goToStudentProjects() {
    const user = await loginAs('student');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    return user;
  }

  it('shows join project form when Join Project is clicked', async () => {
    const user = await goToStudentProjects();
    await user.click(screen.getByText('Join Project'));
    expect(screen.getByText('Join Project by Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('ABCDEFG1')).toBeInTheDocument();
  });

  it('keeps form open for invalid project code', async () => {
    const user = await goToStudentProjects();
    await user.click(screen.getByText('Join Project'));
    await user.type(screen.getByPlaceholderText('ABCDEFG1'), 'INVALID1');
    await user.click(screen.getByText('Join'));
    expect(screen.getByText('Join Project by Code')).toBeInTheDocument();
  });

  it('joins a project with valid code and closes the form', async () => {
    const user = await goToStudentProjects();
    await user.click(screen.getByText('Join Project'));
    await user.type(screen.getByPlaceholderText('ABCDEFG1'), 'WDB2026');
    await user.click(screen.getByText('Join'));
    expect(screen.queryByText('Join Project by Code')).not.toBeInTheDocument();
  });

  it('cancels join project form', async () => {
    const user = await goToStudentProjects();
    await user.click(screen.getByText('Join Project'));
    expect(screen.getByText('Join Project by Code')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Join Project by Code')).not.toBeInTheDocument();
  });
});

describe('App – lecturer navigation tabs', () => {
  it('shows Projects tab with create button', async () => {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    expect(screen.getByText('+ Create Project')).toBeInTheDocument();
  });

  it('shows project cards in Projects tab', async () => {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    expect(screen.getByText('Web Development Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('AI Research Initiative')).toBeInTheDocument();
  });

  it('can switch to Skills tab', async () => {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Skills', { selector: '.nav-label' }));
    expect(screen.getByText('Machine Learning')).toBeInTheDocument();
  });

  it('can switch to Archived Projects tab', async () => {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Archived Projects', { selector: '.nav-label' }));
    expect(screen.getByText('Mobile App Development')).toBeInTheDocument();
  });
});

describe('App – lecturer create project', () => {
  async function goToLecturerProjects() {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    return user;
  }

  it('opens create project form', async () => {
    const user = await goToLecturerProjects();
    await user.click(screen.getByText('+ Create Project'));
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter project name...')).toBeInTheDocument();
  });

  it('creates a project successfully', async () => {
    const user = await goToLecturerProjects();
    await user.click(screen.getByText('+ Create Project'));
    await user.type(screen.getByPlaceholderText('Enter project name...'), 'Test Project');
    await user.type(screen.getByPlaceholderText('Enter project description...'), 'Test description');
    await user.click(screen.getByText('Create Project'));

    expect(screen.getByText(/Project created!/)).toBeInTheDocument();
    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('cancels create project form', async () => {
    const user = await goToLecturerProjects();
    await user.click(screen.getByText('+ Create Project'));
    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    await user.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Create New Project')).not.toBeInTheDocument();
  });
});

describe('App – lecturer manage project', () => {
  async function goToLecturerProjects() {
    const user = await loginAs('lecturer');
    await user.click(screen.getByText('Projects', { selector: '.nav-label' }));
    return user;
  }

  it('opens manage panel for a project', async () => {
    const user = await goToLecturerProjects();
    const manageButtons = screen.getAllByText('Manage Project');
    await user.click(manageButtons[0]);

    expect(screen.getByText('Manage: Web Development Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('WDB2026')).toBeInTheDocument();
  });

  it('shows students in managed project', async () => {
    const user = await goToLecturerProjects();
    const manageButtons = screen.getAllByText('Manage Project');
    await user.click(manageButtons[0]);

    expect(screen.getByText('Maya Kim')).toBeInTheDocument();
    expect(screen.getByText('Jon Lee')).toBeInTheDocument();
  });

  it('shows student skills in managed project', async () => {
    const user = await goToLecturerProjects();
    const manageButtons = screen.getAllByText('Manage Project');
    await user.click(manageButtons[0]);

    const table = screen.getByRole('table');
    expect(within(table).getAllByText('Web Dev').length).toBeGreaterThan(0);
    expect(within(table).getByText('React')).toBeInTheDocument();
  });

  it('closes manage panel with back button', async () => {
    const user = await goToLecturerProjects();
    const manageButtons = screen.getAllByText('Manage Project');
    await user.click(manageButtons[0]);

    expect(screen.getByText('Manage: Web Development Bootcamp')).toBeInTheDocument();
    await user.click(screen.getByText('← Back'));

    expect(screen.queryByText('Manage: Web Development Bootcamp')).not.toBeInTheDocument();
  });
});

describe('App – restoring session from localStorage', () => {
  it('restores authenticated student from localStorage on mount', () => {
    const storedUser = { role: 'student', email: 'saved@school.edu', name: 'Saved User' };
    localStorage.setItem('authUser', JSON.stringify(storedUser));

    render(<App />);
    expect(screen.getByText('Student Portal')).toBeInTheDocument();
    expect(screen.getByText('Saved User', { selector: '.profile-name' })).toBeInTheDocument();
  });

  it('restores lecturer session from localStorage', () => {
    const storedUser = { role: 'lecturer', email: 'prof@school.edu', name: 'Dr. Stored' };
    localStorage.setItem('authUser', JSON.stringify(storedUser));

    render(<App />);
    expect(screen.getByText('Lecturer Portal')).toBeInTheDocument();
    expect(screen.getByText('Dr. Stored', { selector: '.profile-name' })).toBeInTheDocument();
  });
});

describe('App – student registration flow', () => {
  it('registers as student with name and email', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(getRegisterNavButton());

    await user.type(screen.getByPlaceholderText('you@school.edu'), 'new@school.edu');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.type(screen.getByPlaceholderText('Maya Kim'), 'New Student');

    const modal = screen.getByRole('dialog');
    await user.click(within(modal).getByRole('button', { name: 'Create account' }));

    expect(screen.getByText('Student Portal')).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('authUser'));
    expect(stored.name).toBe('New Student');
    expect(stored.role).toBe('student');
  });
});
