// Cadence — sample data + localStorage persistence

const TODAY = new Date();
const d = (offsetDays) => {
  const dt = new Date(TODAY);
  dt.setDate(dt.getDate() + offsetDays);
  return dt.toISOString().split('T')[0];
};

const DEFAULT_PROJECTS = [];

const DEFAULT_TASKS = [];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadState() {
  try {
    const raw = localStorage.getItem('cadence_state');
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        tasks: parsed.tasks || [],
        projects: parsed.projects || [],
      };
    }
  } catch (e) {}
  return { tasks: [], projects: [] };
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

function getTimeMode() {
  const h = new Date().getHours();
  return (h >= 10 && h < 19) ? 'work' : 'personal';
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
  getTimeMode,
});
