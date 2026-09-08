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

export const COLLABORATION_OPTIONS = [
  'Hackathons',
  'College Projects',
  'Open Source',
  'Research',
  'Startup',
  'Freelance',
];

export const PROJECT_TYPES = [
  'Hackathon',
  'College Project',
  'Open Source',
  'Startup',
  'Research',
  'Competition',
  'Personal Project',
  'Other',
];

export const ACHIEVEMENT_CATEGORIES = [
  'Hackathon',
  'Competition',
  'Certification',
  'Coding',
  'Academic',
  'Other',
];

export const POPULAR_ROLES = [
  'Backend Developer',
  'Frontend Developer',
  'Fullstack Developer',
  'ML / AI Engineer',
  'UI/UX Designer',
  'DevOps / Cloud',
  'Mobile Developer',
  'Researcher',
  'Product Manager',
  'Other / Custom',
];

export const SUGGESTED_ROLES_CATEGORIES = {
  Technical: [
    'Backend Developer',
    'Frontend Developer',
    'Fullstack Developer',
    'Software Engineer',
    'Software Developer',
    'Java Developer',
    'Python Developer',
    'C++ Developer',
    'JavaScript Developer',
    'TypeScript Developer',
    'React Developer',
    'Angular Developer',
    'Vue.js Developer',
    'Node.js Developer',
    'Spring Boot Developer',
    'Android Developer',
    'iOS Developer',
    'Mobile App Developer',
    'Flutter Developer',
    'React Native Developer',
    'DevOps Engineer',
    'Cloud Engineer',
    'Cloud Architect',
    'Site Reliability Engineer',
    'Data Engineer',
    'Data Analyst',
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'Deep Learning Engineer',
    'NLP Engineer',
    'Computer Vision Engineer',
    'MLOps Engineer',
    'Cybersecurity Engineer',
    'Security Analyst',
    'Blockchain Developer',
    'Web3 Developer',
    'Smart Contract Developer',
    'Game Developer',
    'AR/VR Developer',
    'IoT Developer',
    'Embedded Systems Engineer',
    'Robotics Engineer',
    'QA Engineer',
    'Test Engineer',
    'Automation Engineer',
    'Database Engineer',
    'Network Engineer',
  ],
  'Design & Product': [
    'UI/UX Designer',
    'Product Designer',
    'UX Researcher',
    'Product Manager',
    'Product Owner',
    'Project Manager',
    'Business Analyst',
    'Technical Product Manager',
    'Solution Architect',
    'System Architect',
  ],
  'Research & Business': [
    'Researcher',
    'Technical Researcher',
    'Market Researcher',
    'Content Writer',
    'Technical Writer',
    'Content Strategist',
    'Social Media Manager',
    'Community Manager',
    'Marketing Specialist',
    'Growth Manager',
    'Business Development',
    'Operations Manager',
    'Finance',
    'Legal/Compliance',
  ],
  Hackathon: [
    'Team Lead',
    'Technical Lead',
    'Research Lead',
    'Presentation Lead',
    'Pitch Specialist',
    'Demo Specialist',
    'Documentation Lead',
  ],
  Custom: [
    'Other / Custom',
  ],
};

export const ALL_SUGGESTED_ROLES = [
  ...SUGGESTED_ROLES_CATEGORIES.Technical,
  ...SUGGESTED_ROLES_CATEGORIES['Design & Product'],
  ...SUGGESTED_ROLES_CATEGORIES['Research & Business'],
  ...SUGGESTED_ROLES_CATEGORIES.Hackathon,
  'Other / Custom',
];
