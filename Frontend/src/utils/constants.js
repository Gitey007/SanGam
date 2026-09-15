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
  'Personal Project',
  'Research',
  'Competition',
  'Startup / Product',
  'Open Source',
  'Other',
];

export const PROJECT_TYPE_THEMES = {
  Hackathon: {
    label: 'Hackathon',
    icon: '🏆',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
    accentClass: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
    cardBorderClass: 'hover:border-amber-400/50 dark:hover:border-amber-600/50',
  },
  'College Project': {
    label: 'College Project',
    icon: '🎓',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80',
    accentClass: 'border-blue-500/30 text-blue-600 dark:text-blue-400',
    cardBorderClass: 'hover:border-blue-400/50 dark:hover:border-blue-600/50',
  },
  'Personal Project': {
    label: 'Personal Project',
    icon: '💡',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
    accentClass: 'border-rose-500/30 text-rose-600 dark:text-rose-400',
    cardBorderClass: 'hover:border-rose-400/50 dark:hover:border-rose-600/50',
  },
  Research: {
    label: 'Research',
    icon: '🔬',
    badgeClass: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
    accentClass: 'border-purple-500/30 text-purple-600 dark:text-purple-400',
    cardBorderClass: 'hover:border-purple-400/50 dark:hover:border-purple-600/50',
  },
  Competition: {
    label: 'Competition',
    icon: '⚔️',
    badgeClass: 'bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/80',
    accentClass: 'border-orange-500/30 text-orange-600 dark:text-orange-400',
    cardBorderClass: 'hover:border-orange-400/50 dark:hover:border-orange-600/50',
  },
  'Startup / Product': {
    label: 'Startup / Product',
    icon: '💼',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    accentClass: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    cardBorderClass: 'hover:border-emerald-400/50 dark:hover:border-emerald-600/50',
  },
  Startup: {
    label: 'Startup',
    icon: '💼',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
    accentClass: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    cardBorderClass: 'hover:border-emerald-400/50 dark:hover:border-emerald-600/50',
  },
  'Open Source': {
    label: 'Open Source',
    icon: '🌐',
    badgeClass: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
    accentClass: 'border-sky-500/30 text-sky-600 dark:text-sky-400',
    cardBorderClass: 'hover:border-sky-400/50 dark:hover:border-sky-600/50',
  },
  Other: {
    label: 'Other',
    icon: '📁',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    accentClass: 'border-slate-400/30 text-slate-600 dark:text-slate-400',
    cardBorderClass: 'hover:border-slate-300 dark:hover:border-slate-700',
  },
};

export const getProjectTypeTheme = (type) => {
  if (!type) {
    return PROJECT_TYPE_THEMES.Hackathon;
  }
  const trimmed = type.trim();
  if (PROJECT_TYPE_THEMES[trimmed]) {
    return PROJECT_TYPE_THEMES[trimmed];
  }
  const lower = trimmed.toLowerCase();
  for (const [key, theme] of Object.entries(PROJECT_TYPE_THEMES)) {
    if (key.toLowerCase() === lower) {
      return theme;
    }
  }
  return {
    label: trimmed,
    icon: '📁',
    badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    accentClass: 'border-slate-400/30 text-slate-600 dark:text-slate-400',
    cardBorderClass: 'hover:border-slate-300 dark:hover:border-slate-700',
  };
};

export const ACHIEVEMENT_CATEGORIES = [
  'Hackathon',
  'Competition',
  'Certification',
  'Coding',
  'Academic',
  'Other',
];

export const ACHIEVEMENT_CATEGORY_STYLES = {
  Hackathon: {
    bg: '#F3E8FF',
    text: '#7E22CE',
    border: '#D8B4FE',
    className: 'bg-[#F3E8FF] dark:bg-purple-950/60 text-[#7E22CE] dark:text-purple-300 border-[#D8B4FE] dark:border-purple-800/60',
  },
  Competition: {
    bg: '#E0F2FE',
    text: '#0369A1',
    border: '#BAE6FD',
    className: 'bg-[#E0F2FE] dark:bg-sky-950/60 text-[#0369A1] dark:text-sky-300 border-[#BAE6FD] dark:border-sky-800/60',
  },
  Certification: {
    bg: '#DCFCE7',
    text: '#15803D',
    border: '#BBF7D0',
    className: 'bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-300 border-[#BBF7D0] dark:border-emerald-800/60',
  },
  Coding: {
    bg: '#FFF7ED',
    text: '#C2410C',
    border: '#FED7AA',
    className: 'bg-[#FFF7ED] dark:bg-orange-950/60 text-[#C2410C] dark:text-orange-300 border-[#FED7AA] dark:border-orange-800/60',
  },
  Academic: {
    bg: '#CCFBF1',
    text: '#0F766E',
    border: '#99F6E4',
    className: 'bg-[#CCFBF1] dark:bg-teal-950/60 text-[#0F766E] dark:text-teal-300 border-[#99F6E4] dark:border-teal-800/60',
  },
  Other: {
    bg: '#F1F5F9',
    text: '#475569',
    border: '#CBD5E1',
    className: 'bg-[#F1F5F9] dark:bg-slate-800/80 text-[#475569] dark:text-slate-300 border-[#CBD5E1] dark:border-slate-700',
  },
};

export const getAchievementCategoryBadgeClass = (category) => {
  if (!category) return ACHIEVEMENT_CATEGORY_STYLES.Other.className;
  const match = Object.keys(ACHIEVEMENT_CATEGORY_STYLES).find(
    (key) => key.toLowerCase() === String(category).trim().toLowerCase()
  );
  return match ? ACHIEVEMENT_CATEGORY_STYLES[match].className : ACHIEVEMENT_CATEGORY_STYLES.Other.className;
};

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
