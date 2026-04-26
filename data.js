// Cadence — sample data + localStorage persistence

const TODAY = new Date(2026, 3, 26); // April 26, 2026
const d = (offsetDays) => {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString().split('T')[0];
};

const DEFAULT_PROJECTS = [
  {
    id: 'p1',
    name: 'IELTS Preparation',
    color: '#c17b4e',
    icon: '📚',
    description: 'Targeting Band 7.5 overall. Exam booked at British Council on May 14. Focus areas: Writing Task 2 coherence, Listening sections 3–4, Speaking fluency.',
    deadline: '2026-05-14',
    deadlineLabel: 'Exam day',
    milestones: [
      { id: 'm1', title: 'Full mock exam', date: d(7), done: false },
      { id: 'm2', title: 'Speaking mock with tutor', date: d(5), done: false },
      { id: 'm3', title: 'Writing Task 2 — 5 timed essays', date: d(10), done: false },
      { id: 'm4', title: 'Vocabulary review complete', date: d(-3), done: true },
    ],
    targetScore: '7.5',
  },
  {
    id: 'p2',
    name: 'Personal',
    color: '#5a7fa3',
    icon: '🌱',
    description: 'Everyday tasks, admin, health, and life logistics. Keep this list short and actionable.',
    deadline: null,
    deadlineLabel: null,
    milestones: [],
    targetScore: null,
  },
  {
    id: 'p3',
    name: 'Reading List',
    color: '#7a6ea0',
    icon: '📖',
    description: 'Non-fiction focused. One book per 2–3 weeks. Currently on Deep Work.',
    deadline: null,
    deadlineLabel: null,
    milestones: [
      { id: 'm5', title: 'Finish Deep Work', date: d(10), done: false },
      { id: 'm6', title: 'Start Atomic Habits', date: d(14), done: false },
    ],
    targetScore: null,
  },
];

const DEFAULT_TASKS = [
  // IELTS — exam in 18 days
  {
    id: 't1', projectId: 'p1', title: 'Complete Academic Writing Task 2 practice',
    status: 'todo', priority: 'high', due: d(1), today: true, weight: 9,
    notes: 'Focus on argument structure and cohesion. Aim for band 7+.',
    subtasks: [
      { id: 'st1', title: 'Write essay draft on urbanisation topic', done: false },
      { id: 'st2', title: 'Self-grade using IELTS rubric', done: false },
      { id: 'st3', title: 'Rewrite weak paragraphs', done: false },
    ]
  },
  {
    id: 't2', projectId: 'p1', title: 'Listening practice — Section 3 & 4 (academic)',
    status: 'doing', priority: 'high', due: d(0), today: true, weight: 8,
    notes: 'Cambridge IELTS 17, Test 2. Sections 3 and 4 are the hardest.',
    subtasks: [
      { id: 'st4', title: 'Section 3 — complete and review', done: true },
      { id: 'st5', title: 'Section 4 — complete and review', done: false },
    ]
  },
  {
    id: 't3', projectId: 'p1', title: 'Speaking mock test with timer',
    status: 'todo', priority: 'high', due: d(2), today: false, weight: 8,
    notes: 'Record yourself. Review for fluency, vocab range, pronunciation.',
    subtasks: []
  },
  {
    id: 't4', projectId: 'p1', title: 'Read 3 academic articles — annotate key vocab',
    status: 'todo', priority: 'medium', due: d(3), today: false, weight: 6,
    notes: 'Guardian, BBC Science, The Economist.',
    subtasks: [
      { id: 'st6', title: 'Article 1 — climate policy', done: false },
      { id: 'st7', title: 'Article 2 — AI in medicine', done: false },
      { id: 'st8', title: 'Article 3 — urban migration', done: false },
    ]
  },
  {
    id: 't5', projectId: 'p1', title: 'Full mock exam — timed, all four sections',
    status: 'todo', priority: 'high', due: d(7), today: false, weight: 10,
    notes: '3 hours. Treat it like the real exam day.',
    subtasks: []
  },
  {
    id: 't6', projectId: 'p1', title: 'Review Speaking Part 2 cue card bank',
    status: 'done', priority: 'medium', due: d(-2), today: false, weight: 5,
    notes: 'Covered 30 topics. Good.',
    subtasks: []
  },
  {
    id: 't7', projectId: 'p1', title: 'Grammar — conditional sentences deep dive',
    status: 'done', priority: 'low', due: d(-5), today: false, weight: 4,
    notes: 'All four conditionals reviewed.',
    subtasks: []
  },
  {
    id: 't8', projectId: 'p1', title: 'Register for exam — confirm booking ref',
    status: 'done', priority: 'high', due: d(-10), today: false, weight: 9,
    notes: 'Done. Exam on May 14.',
    subtasks: []
  },
  // Exam day
  {
    id: 't9', projectId: 'p1', title: '🎯 IELTS Exam Day',
    status: 'todo', priority: 'high', due: d(18), today: false, weight: 10,
    notes: 'British Council test centre. Arrive 30 min early. Passport required.',
    subtasks: []
  },
  // Personal
  {
    id: 't10', projectId: 'p2', title: 'Call family — weekly check-in',
    status: 'todo', priority: 'medium', due: d(0), today: true, weight: 5,
    notes: '',
    subtasks: []
  },
  {
    id: 't11', projectId: 'p2', title: 'Sort out health insurance renewal',
    status: 'todo', priority: 'high', due: d(4), today: false, weight: 7,
    notes: 'Expires May 2. Do NOT leave this.',
    subtasks: [
      { id: 'st9', title: 'Compare plans online', done: false },
      { id: 'st10', title: 'Submit renewal form', done: false },
    ]
  },
  {
    id: 't12', projectId: 'p2', title: 'Buy groceries',
    status: 'done', priority: 'low', due: d(-1), today: false, weight: 2,
    notes: '',
    subtasks: []
  },
  {
    id: 't13', projectId: 'p2', title: 'Morning run — 5km',
    status: 'doing', priority: 'low', due: d(0), today: true, weight: 3,
    notes: 'Keep the streak alive.',
    subtasks: []
  },
  // Reading List
  {
    id: 't14', projectId: 'p3', title: 'Finish "Deep Work" — Cal Newport',
    status: 'doing', priority: 'medium', due: d(10), today: false, weight: 5,
    notes: 'On chapter 4.',
    subtasks: []
  },
  {
    id: 't15', projectId: 'p3', title: 'Start "Atomic Habits" — James Clear',
    status: 'todo', priority: 'low', due: d(14), today: false, weight: 3,
    notes: '',
    subtasks: []
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadState() {
  try {
    const raw = localStorage.getItem('cadence_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      // Merge stored projects with DEFAULT_PROJECTS to pick up new fields
      const mergedProjects = DEFAULT_PROJECTS.map(def => {
        const stored = (parsed.projects || []).find(p => p.id === def.id);
        return stored ? { ...def, ...stored } : def;
      });
      return {
        tasks: parsed.tasks || DEFAULT_TASKS,
        projects: mergedProjects,
      };
    }
  } catch (e) {}
  return { tasks: DEFAULT_TASKS, projects: DEFAULT_PROJECTS };
}

function saveState(tasks, projects) {
  try {
    localStorage.setItem('cadence_state', JSON.stringify({ tasks, projects }));
  } catch (e) {}
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const dt = parseDate(dateStr);
  const now = new Date(TODAY);
  now.setHours(0, 0, 0, 0);
  return Math.round((dt - now) / 86400000);
}

function formatDue(dateStr) {
  if (!dateStr) return '';
  const diff = daysUntil(dateStr);
  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  if (diff <= 6) return `in ${diff}d`;
  const dt = parseDate(dateStr);
  return dt.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
}

function isOverdue(task) {
  if (task.status === 'done') return false;
  const diff = daysUntil(task.due);
  return diff !== null && diff < 0;
}

function urgencyScore(task) {
  const diff = daysUntil(task.due);
  const deadlinePressure = diff === null ? 0 : Math.max(0, 10 - diff);
  const priorityMap = { high: 3, medium: 2, low: 1 };
  return deadlinePressure + (priorityMap[task.priority] || 1) * 2 + (task.weight || 5);
}

// Expose globally
Object.assign(window, {
  CADENCE_TODAY: TODAY,
  DEFAULT_TASKS,
  DEFAULT_PROJECTS,
  loadState,
  saveState,
  parseDate,
  daysUntil,
  formatDue,
  isOverdue,
  urgencyScore,
});
