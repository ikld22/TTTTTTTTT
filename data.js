// Cadence — sample data + localStorage persistence

const TODAY = new Date(2026, 3, 26); // April 26, 2026
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
