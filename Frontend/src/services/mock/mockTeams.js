/**
 * Mock Teams Dataset
 * Used by teamApi.js as a structured fallback until backend team endpoint contracts are finalized.
 */
export const MOCK_TEAMS = [
  {
    id: 'team-1',
    name: 'Algoverse Engine',
    description: 'Building a collaborative coding and algorithm visualization tool for competitive programming clubs.',
    leader: {
      id: 1,
      name: 'Sahul Kumar',
      college: 'ABES Engineering College',
    },
    members: [
      { id: 1, name: 'Sahul Kumar', role: 'Leader' },
      { id: 2, name: 'Aanya Sharma', role: 'Frontend' },
    ],
    maxMembers: 4,
    requiredSkills: ['Spring Boot', 'React', 'WebSocket'],
    status: 'OPEN',
    createdAt: '2026-08-20T10:00:00Z',
  },
  {
    id: 'team-2',
    name: 'NeuroCampus AI',
    description: 'Developing an open-source campus question-answering assistant trained on university syllabi and research archives.',
    leader: {
      id: 4,
      name: 'Priyanka Nair',
      college: 'IIT Delhi',
    },
    members: [
      { id: 4, name: 'Priyanka Nair', role: 'Leader' },
      { id: 5, name: 'Aditya Patel', role: 'Systems & ML' },
    ],
    maxMembers: 4,
    requiredSkills: ['Python', 'PyTorch', 'FastAPI', 'React'],
    status: 'OPEN',
    createdAt: '2026-08-22T14:30:00Z',
  },
  {
    id: 'team-3',
    name: 'PulseTrack',
    description: 'Smart student attendance and event participation tracking using decentralized cryptography.',
    leader: {
      id: 3,
      name: 'Rohan Verma',
      college: 'ABES Engineering College',
    },
    members: [
      { id: 3, name: 'Rohan Verma', role: 'Leader' },
    ],
    maxMembers: 3,
    requiredSkills: ['Java', 'Kubernetes', 'PostgreSQL'],
    status: 'OPEN',
    createdAt: '2026-08-25T09:15:00Z',
  },
];
