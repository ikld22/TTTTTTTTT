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
          {task.type && (
            <span className={`task-type-tag task-type-tag-${task.type}`}>{task.type}</span>
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
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [due, setDue] = useState('');
  const [taskType, setTaskType] = useState(getTimeMode);

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
      type: taskType,
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

  const selectedProject = projects.find(p => p.id === projectId);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form className="tam fade-in" onSubmit={handleSubmit}>

        {/* ── Project row ── */}
        <div className="tam-projects">
          <button type="button"
            className={`tam-proj ${projectId === '' ? 'active' : ''}`}
            onClick={() => setProjectId('')}>
            No project
          </button>
          {projects.map(p => (
            <button key={p.id} type="button"
              className={`tam-proj ${projectId === p.id ? 'active' : ''}`}
              onClick={() => setProjectId(p.id)}>
              <span className="tam-proj-dot" style={{ background: p.color }} />
              {p.name}
            </button>
          ))}
          <button type="button" className="tam-x" onClick={onClose}>×</button>
        </div>

        {/* ── Title ── */}
        <input
          className="tam-title"
          placeholder="What needs to be done?"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={handleKey}
          autoFocus
        />

        {/* ── Meta row ── */}
        <div className="tam-meta">

          {/* Due date */}
          <label className="tam-meta-btn">
            <span style={{ opacity: due ? 1 : 0.45 }}>◷</span>
            <input type="date" value={due} onChange={e => setDue(e.target.value)}
              className="tam-date" />
          </label>

          <div className="tam-divider" />

          {/* Priority */}
          {[
            { v:'high',   label:'↑ High', color:'var(--red)'    },
            { v:'medium', label:'· Med',  color:'var(--yellow)' },
            { v:'low',    label:'↓ Low',  color:'var(--ink4)'   },
          ].map(p => (
            <button key={p.v} type="button"
              className={`tam-meta-btn ${priority === p.v ? 'active' : ''}`}
              onClick={() => setPriority(p.v)}
              style={priority === p.v ? { color: p.color } : {}}>
              {p.label}
            </button>
          ))}

          <div className="tam-divider" />

          {/* Type */}
          {['work','personal'].map(t => (
            <button key={t} type="button"
              className={`tam-type tam-type-${t} ${taskType === t ? 'active' : ''}`}
              onClick={() => setTaskType(t)}>
              {t}
            </button>
          ))}

          <button type="submit" className="tam-submit" disabled={!title.trim()}>
            Add task ↵
          </button>
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
  const [projType, setProjType] = useState(getTimeMode);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: 'p' + Date.now(),
      name: name.trim(),
      icon,
      color,
      type: projType,
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
      <form className="quick-add fade-in" onSubmit={handleSubmit}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:10, padding:'16px 20px 14px', borderBottom:'1px solid var(--border)' }}>
          <input
            value={icon}
            onChange={e => setIcon(e.target.value)}
            maxLength={2}
            title="Icon"
            style={{ width:40, textAlign:'center', fontSize:20, border:'1px solid var(--border)', borderRadius:'var(--r)', background:'var(--bg2)', color:'var(--ink)', fontFamily:'var(--sans)', padding:'4px 0', cursor:'text' }}
          />
          <input
            className="quick-add-input"
            placeholder="Project name…"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            style={{ padding:'0', fontSize:17, flex:1 }}
          />
        </div>

        {/* Description */}
        <textarea
          placeholder="Description (optional)"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          style={{ display:'block', width:'100%', padding:'14px 20px', border:'none', borderBottom:'1px solid var(--border)', background:'transparent', fontFamily:'var(--sans)', fontSize:13, color:'var(--ink)', resize:'none', outline:'none', minHeight:72, boxSizing:'border-box' }}
        />

        {/* Footer: colors + actions */}
        <div className="quick-add-footer">
          <div style={{ display:'flex', gap:7, alignItems:'center' }}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                style={{ width:18, height:18, borderRadius:'50%', background:c, border: color===c ? '2px solid var(--ink)' : '2px solid transparent', outline: color===c ? '2px solid '+c : 'none', outlineOffset:2, cursor:'pointer', flexShrink:0, padding:0 }} />
            ))}
          </div>
          <div style={{ display:'flex', gap:3 }}>
            {['work','personal'].map(t => (
              <button key={t} type="button"
                className={`pill btn-sm ${projType === t ? 'active' : ''}`}
                onClick={() => setProjType(t)}
                style={{ padding:'3px 9px', fontSize:11 }}
              >{t}</button>
            ))}
          </div>
          <span className="quick-add-hint" style={{ marginLeft:'auto' }}><kbd>Esc</kbd> to close</span>
          <button type="submit" className="btn btn-primary btn-sm">Add Project</button>
        </div>

      </form>
    </div>
  );
}

// ─── AICoach ───────────────────────────────────────────────────────────────────
function AICoach({ tasks, projects }) {
  const [apiKey,    setApiKey]    = React.useState(() => window.DEEPSEEK_KEY || localStorage.getItem('ds_key') || '');
  const [keyDraft,  setKeyDraft]  = React.useState('');
  const [msgs,      setMsgs]      = React.useState([]);
  const [draft,     setDraft]     = React.useState('');
  const [loading,   setLoading]   = React.useState(false);
  const bodyRef = React.useRef(null);

  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [msgs, loading]);

  // Auto-ask once on mount if key exists (config.js or localStorage)
  React.useEffect(() => {
    if (window.DEEPSEEK_KEY || localStorage.getItem('ds_key')) sendMsg('What should I focus on right now?', []);
  }, []);

  const buildContext = () => {
    const active = tasks.filter(t => t.status !== 'done').slice(0, 15);
    if (!active.length) return 'No active tasks right now.';
    return active.map(t => {
      const p = projects.find(p => p.id === t.projectId);
      return `• "${t.title}" [project: ${p?.name || '—'}, due: ${t.due || 'none'}, priority: ${t.priority}, status: ${t.status}]`;
    }).join('\n');
  };

  const sendMsg = async (text, currentMsgs) => {
    const key = window.DEEPSEEK_KEY || localStorage.getItem('ds_key');
    if (!key || !text.trim() || loading) return;

    const next = [...currentMsgs, { role: 'user', content: text.trim() }];
    setMsgs(next);
    setDraft('');
    setLoading(true);

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: `You are a sharp, warm focus coach inside a task manager called Cadence.
Your job: help the user decide which ONE task to work on right now.
Be direct and concise — max 3 sentences per reply. No fluff.
User's active tasks:\n${buildContext()}`,
            },
            ...next,
          ],
          max_tokens: 200,
          temperature: 0.65,
        }),
      });
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      setMsgs(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
    } catch (e) {
      setMsgs(prev => [...prev, { role: 'assistant', content: `⚠ ${e.message}` }]);
    }
    setLoading(false);
  };

  const saveKey = () => {
    const k = keyDraft.trim();
    if (!k) return;
    localStorage.setItem('ds_key', k);
    setApiKey(k);
    setKeyDraft('');
    sendMsg('What should I focus on right now?', []);
  };

  const reset = () => {
    localStorage.removeItem('ds_key');
    setApiKey('');
    setMsgs([]);
  };

  // ── No key yet: show setup ─────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className="ai-coach-card">
        <div className="ai-coach-hd">
          <span className="ai-coach-icon">◈</span>
          <span className="ai-coach-title">Focus Coach</span>
          <span className="ai-coach-badge">DeepSeek AI</span>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <p style={{ fontSize: 13, color: 'var(--ink3)', marginBottom: 12, lineHeight: 1.55 }}>
            Connect DeepSeek to get a coach that tells you exactly which task to work on next.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              type="password"
              placeholder="sk-…"
              value={keyDraft}
              onChange={e => setKeyDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveKey()}
              className="qa-select"
              style={{ flex: 1, fontSize: 13 }}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={saveKey} disabled={!keyDraft.trim()}>
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Has key: show chat ─────────────────────────────────────────────────────
  return (
    <div className="ai-coach-card">
      <div className="ai-coach-hd">
        <span className="ai-coach-icon">◈</span>
        <span className="ai-coach-title">Focus Coach</span>
        <span className="ai-coach-badge">DeepSeek AI</span>
        <button onClick={reset}
          style={{ marginLeft:'auto', background:'none', border:'none', cursor:'pointer', color:'var(--ink4)', fontSize:11 }}>
          disconnect
        </button>
      </div>

      <div className="ai-coach-body" ref={bodyRef}>
        {msgs.length === 0 && !loading && (
          <button className="btn btn-accent" style={{ width:'100%' }}
            onClick={() => sendMsg('What should I focus on right now?', [])}>
            ◎ Ask what to focus on
          </button>
        )}
        {msgs.map((m, i) => {
          if (i === 0 && m.role === 'user') return null;
          return (
            <div key={i} className={`ai-msg ai-msg-${m.role}`}>{m.content}</div>
          );
        })}
        {loading && (
          <div className="ai-msg ai-msg-assistant ai-thinking">
            <span className="ai-dot"/><span className="ai-dot"/><span className="ai-dot"/>
          </div>
        )}
      </div>

      {msgs.length > 0 && (
        <div style={{ padding:'0 16px 14px', display:'flex', gap:8 }}>
          <input
            placeholder="Ask a follow-up…"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && draft.trim() && !loading) sendMsg(draft, msgs); }}
            className="qa-select"
            style={{ flex:1, fontSize:13 }}
            disabled={loading}
          />
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => sendMsg(draft, msgs)}
            disabled={loading || !draft.trim()}
          >↵</button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { TaskItem, RhythmBar, DetailPanel, QuickAddModal, AddProjectModal, weightColor, AICoach });