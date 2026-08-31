export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

export const AUTH_TOKEN_KEY = 'sangam_auth_token';
export const AUTH_USER_KEY = 'sangam_auth_user';

export const DISCOVERY_SCOPES = {
  ALL: 'ALL',
  MY_COLLEGE: 'MY_COLLEGE',
  INTER_COLLEGE: 'INTER_COLLEGE',
};

export const SCOPE_LABELS = [
  { id: DISCOVERY_SCOPES.ALL, label: 'All Students', description: 'Browse peers across all institutions' },
  { id: DISCOVERY_SCOPES.MY_COLLEGE, label: 'My College', description: 'Find collaborators on your campus' },
  { id: DISCOVERY_SCOPES.INTER_COLLEGE, label: 'Inter College', description: 'Connect with students from other colleges' },
];

export const YEAR_OPTIONS = [
  { label: 'All Years', value: '' },
  { label: 'Year 1', value: '1' },
  { label: 'Year 2', value: '2' },
  { label: 'Year 3', value: '3' },
  { label: 'Year 4', value: '4' },
];

export const POPULAR_SKILLS = [
  'React',
  'Java',
  'Spring Boot',
  'Python',
  'Node.js',
  'TypeScript',
  'Machine Learning',
  'Tailwind CSS',
  'Docker',
  'PostgreSQL',
  'Figma',
  'C++',
  'Rust',
  'Flutter',
];
