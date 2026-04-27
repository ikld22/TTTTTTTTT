// components.jsx — shared UI components

const { useState, useCallback } = React;

// ─── Weight bar color ──────────────────────────────────────────────────────────
function weightColor(w) {
  if (w >= 9) return 'var(--red)';
  if (w >= 7) return 'var(--accent)';
  if (w >= 5) return 'var(--yellow)';
  return 'var(--green)';
}

// ─── TaskItem ──────────────────────────────────────────────────────────────────
function TaskItem({ task, project, onCheck, onStar, onSubtaskCheck, onSelect, showProject = true, cardMode = false }) {
  const [expanded, setExpanded] = useState(false);
  const diff = daysUntil(task.due);
  const dueClass = task.status === 'done' ? '' : diff === null ? '' : diff < 0 ? 'overdue' : diff === 0 ? 'today-due' : diff <= 3 ? 'soon' : 'later';
  const dueLabel = formatDue(task.due);

  const handleClick = (e) => {
    if (e.target.closest('.check-btn') || e.target.closest('.star-btn') || e.target.closest('.subtask-check')) return;
    if (task.subtasks && task.subtasks.length > 0) {
      setExpanded(v => !v);
    }
    onSelect && onSelect(task);
  };

  const inner = (
    <>
      {/* Weight bar */}
      <div className="weight-bar" style={{ background: weightColor(task.weight || 5) }} />

      {/* Check */}
      <button
        className={`check-btn ${task.status}`}
        onClick={(e) => { e.stopPropagation(); onCheck(task.id); }}
        title="Cycle status"
      />

      {/* Body */}
      <div className="task-body">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          {showProject && project && (
            <span className="task-project" style={{ color: project.color }}>
              {project.name}
            </span>
          )}
          {dueLabel && (
            <span className={`task-due ${dueClass}`}>{dueLabel}</span>
          )}
          {task.priority !== 'medium' && (
            <span className={`task-priority ${task.priority}`}>{task.priority}</span>
          )}
          {task.subtasks && task.subtasks.length > 0 && (
            <span style={{ fontSize: 11, color: 'var(--ink4)' }}>
              {task.subtasks.filter(s => s.done).length}/{task.subtasks.length}
            </span>
          )}
        </div>

        {/* Expanded subtasks + notes */}
        {expanded && (
          <div style={{ marginTop: 8 }}>
            {task.notes ? <div className="task-notes">{task.notes}</div> : null}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="subtasks" style={{ marginTop: task.notes ? 8 : 0 }}>
                {task.subtasks.map(st => (
                  <div key={st.id} className="subtask-item">
                    <button
                      className={`subtask-check ${st.done ? 'done' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onSubtaskCheck(task.id, st.id); }}
                    />
                    <span className={`subtask-title ${st.done ? 'done' : ''}`}>{st.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right actions */}
      <div className="task-right">
        <button
          className={`star-btn ${task.today ? 'starred' : ''}`}
          onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
          title={task.today ? 'Remove from today' : 'Add to today'}
        >
          {task.today ? '★' : '☆'}
        </button>
      </div>
    </>
  );

  if (cardMode) {
    return (
      <div
        className={`task-card ${task.status === 'done' ? 'done-item' : ''}`}
        onClick={handleClick}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <div className="weight-bar" style={{ background: weightColor(task.weight || 5), width: 4, minHeight: 40, borderRadius: 2 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <button className={`check-btn ${task.status}`} onClick={(e) => { e.stopPropagation(); onCheck(task.id); }} />
              <div className="task-title" style={{ flex: 1 }}>{task.title}</div>
            </div>
            <div className="task-meta">
              {showProject && project && <span className="task-project" style={{ color: project.color }}>{project.name}</span>}
              {dueLabel && <span className={`task-due ${dueClass}`}>{dueLabel}</span>}
              {task.subtasks && task.subtasks.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--ink4)' }}>{task.subtasks.filter(s => s.done).length}/{task.subtasks.length}</span>
              )}
            </div>
            {task.notes && <div className="task-notes" style={{ marginTop: 8 }}>{task.notes}</div>}
          </div>
          <button
            className={`star-btn ${task.today ? 'starred' : ''}`}
            onClick={(e) => { e.stopPropagation(); onStar(task.id); }}
          >
            {task.today ? '★' : '☆'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`task-item ${task.status === 'done' ? 'done-item' : ''} ${expanded ? 'expanded' : ''}`}
      onClick={handleClick}
    >
      {inner}
    </div>
  );
}

// ─── RhythmBar ─────────────────────────────────────────────────────────────────
function RhythmBar({ tasks }) {
  const days = [];
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date(CADENCE_TODAY);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek);
    day.setDate(startOfWeek.getDate() + i);
    const dateStr = day.toISOString().split('T')[0];
    const dayTasks = tasks.filter(t => t.due === dateStr && t.status !== 'done');
    const isToday = dateStr === today.toISOString().split('T')[0];
    const totalWeight = dayTasks.reduce((s, t) => s + (t.weight || 5), 0);
    days.push({ name: names[day.getDay()], count: dayTasks.length, weight: totalWeight, isToday, dateStr });
  }

  const maxWeight = Math.max(...days.map(d => d.weight), 1);

  return (
    <div className="rhythm-bar">
      <div className="rhythm-label">This week's rhythm</div>
      <div className="rhythm-days">
        {days.map((d, i) => (
          <div key={i} className={`rhythm-day ${d.isToday ? 'today-day' : ''}`}>
            <div className="rhythm-day-name">{d.name}</div>
            <div className="rhythm-beat">
              <div
                className="rhythm-fill"
                style={{
                  height: `${Math.round((d.weight / maxWeight) * 100)}%`,
                  background: d.isToday ? 'var(--accent)' : 'var(--accent2)',
                  opacity: d.isToday ? 1 : 0.6,
                }}
              />
            </div>
            <div className="rhythm-day-count">{d.count || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── DetailPanel ───────────────────────────────────────────────────────────────
function DetailPanel({ task, project, onClose, onCheck, onStar, onSubtaskCheck }) {
  if (!task) return null;
  const dueLabel = formatDue(task.due);
  const diff = daysUntil(task.due);
  const dueClass = task.status === 'done' ? '' : diff === null ? '' : diff < 0 ? 'overdue' : diff === 0 ? 'today-due' : diff <= 3 ? 'soon' : 'later';

  const statusLabels = { todo: 'To do', doing: 'In progress', done: 'Done' };
  const priorityLabels = { high: '↑ High', medium: '· Medium', low: '↓ Low' };

  return (
    <div className="detail-panel fade-in">
      <div className="detail-header">
        <button className="detail-close" onClick={onClose}>×</button>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <button className={`check-btn ${task.status}`} onClick={() => onCheck(task.id)} style={{ flexShrink: 0 }} />
          <div style={{ display: 'flex', gap: 4 }}>
            <div style={{
              width: 8, height: 8, borderRadius: 50,
              background: weightColor(task.weight || 5),
              alignSelf: 'center'
            }} />
          </div>
        </div>
        <div className="detail-title">{task.title}</div>
      </div>
      <div className="detail-body">
        <div className="detail-row">
          <span className="detail-row-label">Project</span>
          <span className="detail-row-value" style={{ color: project?.color }}>{project?.name || '—'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row-label">Status</span>
          <span className="detail-row-value">{statusLabels[task.status]}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row-label">Due</span>
          <span className={`detail-row-value task-due ${dueClass}`} style={{ padding: '1px 6px', borderRadius: 10 }}>{dueLabel || '—'}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row-label">Priority</span>
          <span className={`detail-row-value task-priority ${task.priority}`}>{priorityLabels[task.priority]}</span>
        </div>
        <div className="detail-row">
          <span className="detail-row-label">Weight</span>
          <span className="detail-row-value">{task.weight}/10</span>
        </div>
        <div className="detail-row">
          <span className="detail-row-label">Today</span>
          <span className="detail-row-value">
            <button
              className={`star-btn ${task.today ? 'starred' : ''}`}
              style={{ opacity: 1, fontSize: 16 }}
              onClick={() => onStar(task.id)}
            >
              {task.today ? '★ Starred' : '☆ Add to today'}
            </button>
          </span>
        </div>

        {task.notes ? (
          <>
            <div className="detail-notes-label" style={{ marginTop: 16 }}>Notes</div>
            <div className="detail-notes-text">{task.notes}</div>
          </>
        ) : null}

        {task.subtasks && task.subtasks.length > 0 && (
          <>
            <div className="detail-subtasks-label">
              Subtasks ({task.subtasks.filter(s => s.done).length}/{task.subtasks.length})
            </div>
            <div className="subtasks">
              {task.subtasks.map(st => (
                <div key={st.id} className="subtask-item">
                  <button
                    className={`subtask-check ${st.done ? 'done' : ''}`}
                    onClick={() => onSubtaskCheck(task.id, st.id)}
                  />
                  <span className={`subtask-title ${st.done ? 'done' : ''}`}>{st.title}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── QuickAdd modal ────────────────────────────────────────────────────────────
function QuickAddModal({ projects, onAdd, onClose }) {
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: 't' + Date.now(),
      projectId,
      title: title.trim(),
      status: 'todo',
      priority,
      due: due || null,
      today: false,
      weight: priority === 'high' ? 8 : priority === 'medium' ? 5 : 3,
      notes: '',
      subtasks: [],
    };
    onAdd(newTask);
    onClose();
  };

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="quick-add fade-in" onSubmit={handleSubmit}>
        <input
          className="quick-add-input"
          placeholder="New task…"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />
        <div className="quick-add-footer">
          <select className="qa-select" value={projectId} onChange={e => setProjectId(e.target.value)}>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select className="qa-select" value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="high">↑ High</option>
            <option value="medium">· Medium</option>
            <option value="low">↓ Low</option>
          </select>
          <input
            className="qa-select"
            type="date"
            value={due}
            onChange={e => setDue(e.target.value)}
            style={{ fontFamily: 'var(--sans)' }}
          />
          <span className="quick-add-hint"><kbd>↵</kbd> to add · <kbd>Esc</kbd> to close</span>
          <button type="submit" className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }}>Add</button>
        </div>
      </form>
    </div>
  );
}

// ─── AddProjectModal ───────────────────────────────────────────────────────────
function AddProjectModal({ onAdd, onClose }) {
  const COLORS = ['#c17b4e','#5a7fa3','#7a6ea0','#4a8c6f','#b85555','#b89a3a','#3a8f8a','#8a5a8f'];
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState(COLORS[0]);
  const [desc, setDesc] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: 'p' + Date.now(),
      name: name.trim(),
      icon,
      color,
      description: desc.trim(),
      deadline: null,
      deadlineLabel: null,
      milestones: [],
      targetScore: null,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="quick-add fade-in" onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 14 }}>New Project</div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
          <input
            value={icon}
            onChange={e => setIcon(e.target.value)}
            maxLength={2}
            style={{ width: 52, textAlign: 'center', fontSize: 22, padding: '6px 4px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', fontFamily: 'var(--sans)' }}
          />
          <input
            className="quick-add-input"
            placeholder="Project name…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            style={{ flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {COLORS.map(c => (
            <button key={c} type="button" onClick={() => setColor(c)}
              style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: color === c ? '3px solid var(--ink)' : '3px solid transparent', cursor: 'pointer' }} />
          ))}
        </div>
        <textarea
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border)', borderRadius: 'var(--r)', background: 'var(--surface)', fontFamily: 'var(--sans)', fontSize: 13, resize: 'vertical', minHeight: 60, marginBottom: 12, boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" className="btn btn-sm" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm">Add Project</button>
        </div>
      </form>
    </div>
  );
}

Object.assign(window, { TaskItem, RhythmBar, DetailPanel, QuickAddModal, AddProjectModal, weightColor });