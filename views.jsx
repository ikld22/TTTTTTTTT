// views.jsx — Today, Upcoming, AllTasks, Calendar, Projects, Archive

const { useState, useMemo } = React;

// ─── TODAY VIEW ────────────────────────────────────────────────────────────────
function TodayView({ tasks, projects, onCheck, onStar, onSubtaskCheck, onSelect, taskStyle }) {
  const today = CADENCE_TODAY.toISOString().split('T')[0];
  const todayTasks = tasks.filter(t => t.today && t.status !== 'done');
  const overdueTasks = tasks.filter(t => isOverdue(t));
  const mode = getTimeMode();
  const modeTasks  = todayTasks.filter(t => (t.type || 'work') === mode);
  const laterTasks = todayTasks.filter(t => (t.type || 'work') !== mode);
  const focusPool  = modeTasks.length ? modeTasks : todayTasks;
  const focusTask  = [...focusPool].sort((a, b) => urgencyScore(b) - urgencyScore(a))[0];

  const doneTasks = tasks.filter(t => t.status === 'done');
  const streak = 4; // computed would need real history

  const dayName = CADENCE_TODAY.toLocaleDateString('en-GB', { weekday: 'long' });
  const dateLabel = CADENCE_TODAY.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const getProject = (id) => projects.find(p => p.id === id);

  const taskProps = { onCheck, onStar, onSubtaskCheck, onSelect };

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="today-hero">
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:6 }}>
          <div className="today-date" style={{ marginBottom:0 }}>{dayName} · {dateLabel}</div>
          <div className={`mode-chip mode-chip-${mode}`}>
            <span className="mode-chip-dot" />
            {mode === 'work' ? 'Work Mode · until 7 PM' : 'Personal Mode · until 10 AM'}
          </div>
        </div>
        <h1 className="today-headline">
          Ready for<br /><em>today.</em>
        </h1>
        <p className="today-lede">
          {todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} flagged for today
          {overdueTasks.length > 0 ? `, ${overdueTasks.length} overdue` : ''}.
        </p>
      </div>

      {/* Focus card */}
      {focusTask && (
        <div className="focus-card" onClick={() => onSelect(focusTask)} style={{ cursor: 'pointer' }}>
          <div style={{ flex: 1 }}>
            <div className="focus-label">{mode === 'work' ? 'Work focus' : 'Personal focus'}</div>
            <div className="focus-title">{focusTask.title}</div>
            <div className="focus-meta">
              {getProject(focusTask.projectId)?.name} · {formatDue(focusTask.due)}
            </div>
          </div>
          <button
            className="focus-check"
            onClick={(e) => { e.stopPropagation(); onCheck(focusTask.id); }}
            title="Mark done"
          >
            ✓
          </button>
        </div>
      )}

      {/* AI Coach */}
      <AICoach tasks={tasks} projects={projects} />

      {/* Insights */}
      <div className="insights-row">
        <div className="insight-card">
          <div className={`insight-value ${overdueTasks.length > 0 ? 'red' : 'green'}`}>{overdueTasks.length}</div>
          <div className="insight-label">Overdue</div>
          <div className="insight-sub">{overdueTasks.length === 0 ? 'All clear — great pace.' : 'Address these first.'}</div>
        </div>
        <div className="insight-card">
          <div className="insight-value green">{doneTasks.length}</div>
          <div className="insight-label">Completed</div>
          <div className="insight-sub">{streak}-day streak active</div>
        </div>
      </div>

      {/* Rhythm bar */}
      <RhythmBar tasks={tasks} />

      {/* Overdue */}
      {overdueTasks.length > 0 && (
        <>
          <div className="section-hd">
            <span className="section-title" style={{ color: 'var(--red)' }}>Overdue</span>
            <span className="section-count">{overdueTasks.length}</span>
          </div>
          <div className={taskStyle === 'cards' ? 'task-cards' : 'task-list'}>
            {overdueTasks.map(t => (
              <TaskItem key={t.id} task={t} project={getProject(t.projectId)}
                {...taskProps} cardMode={taskStyle === 'cards'} />
            ))}
          </div>
        </>
      )}

      {/* Today — split by mode */}
      {todayTasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🎉</div>
          <div className="empty-title">All clear!</div>
          <div className="empty-sub">Star tasks to add them here.</div>
        </div>
      ) : (
        <>
          {modeTasks.length > 0 && (
            <>
              <div className="section-hd">
                <span className="section-title">{mode === 'work' ? 'Work' : 'Personal'}</span>
                <span className="section-count">{modeTasks.length}</span>
                <span className={`mode-now-pill mode-now-pill-${mode}`}>now</span>
              </div>
              <div className={taskStyle === 'cards' ? 'task-cards' : 'task-list'}>
                {modeTasks.map(t => (
                  <TaskItem key={t.id} task={t} project={getProject(t.projectId)}
                    {...taskProps} cardMode={taskStyle === 'cards'} />
                ))}
              </div>
            </>
          )}
          {laterTasks.length > 0 && (
            <>
              <div className="section-hd">
                <span className="section-title" style={{ opacity: modeTasks.length ? 0.5 : 1 }}>
                  {mode === 'work' ? 'Personal' : 'Work'}
                </span>
                <span className="section-count" style={{ opacity: modeTasks.length ? 0.5 : 1 }}>
                  {laterTasks.length}
                </span>
                {modeTasks.length > 0 && <span className="mode-later-pill">later</span>}
              </div>
              <div className={taskStyle === 'cards' ? 'task-cards' : 'task-list'}
                style={{ opacity: modeTasks.length ? 0.6 : 1 }}>
                {laterTasks.map(t => (
                  <TaskItem key={t.id} task={t} project={getProject(t.projectId)}
                    {...taskProps} cardMode={taskStyle === 'cards'} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── UPCOMING VIEW ─────────────────────────────────────────────────────────────
function UpcomingView({ tasks, projects, onCheck, onStar, onSubtaskCheck, onSelect, taskStyle }) {
  const getProject = (id) => projects.find(p => p.id === id);
  const active = tasks.filter(t => t.status !== 'done');

  const tomorrow = active.filter(t => daysUntil(t.due) === 1);
  const thisWeek = active.filter(t => { const d = daysUntil(t.due); return d !== null && d >= 2 && d <= 7; });
  const later = active.filter(t => { const d = daysUntil(t.due); return d === null || d > 7; });

  const taskProps = { onCheck, onStar, onSubtaskCheck, onSelect };
  const containerClass = taskStyle === 'cards' ? 'task-cards' : 'task-list';

  const Section = ({ title, items }) => items.length === 0 ? null : (
    <>
      <div className="section-hd">
        <span className="section-title">{title}</span>
        <span className="section-count">{items.length}</span>
      </div>
      <div className={containerClass}>
        {items.map(t => <TaskItem key={t.id} task={t} project={getProject(t.projectId)} {...taskProps} cardMode={taskStyle === 'cards'} />)}
      </div>
    </>
  );

  return (
    <div className="fade-in">
      <Section title="Tomorrow" items={tomorrow} />
      <Section title="This week" items={thisWeek} />
      <Section title="Later" items={later} />
      {tomorrow.length + thisWeek.length + later.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">✨</div>
          <div className="empty-title">Nothing upcoming</div>
          <div className="empty-sub">Add tasks with due dates to see them here.</div>
        </div>
      )}
    </div>
  );
}

// ─── ALL TASKS VIEW ────────────────────────────────────────────────────────────
function AllTasksView({ tasks, projects, onCheck, onStar, onSubtaskCheck, onSelect, taskStyle }) {
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('urgency');
  const getProject = (id) => projects.find(p => p.id === id);

  const filtered = useMemo(() => {
    let list = [...tasks];
    if (filter === 'todo') list = list.filter(t => t.status === 'todo');
    else if (filter === 'doing') list = list.filter(t => t.status === 'doing');
    else if (filter === 'done') list = list.filter(t => t.status === 'done');
    else if (filter !== 'all') list = list.filter(t => t.projectId === filter);

    if (sortBy === 'urgency') list.sort((a, b) => urgencyScore(b) - urgencyScore(a));
    else if (sortBy === 'due') list.sort((a, b) => {
      const da = a.due || '9999-99-99', db = b.due || '9999-99-99';
      return da < db ? -1 : da > db ? 1 : 0;
    });
    else if (sortBy === 'title') list.sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [tasks, filter, sortBy]);

  const taskProps = { onCheck, onStar, onSubtaskCheck, onSelect };

  return (
    <div className="fade-in">
      <div className="filter-pills">
        {[
          { id: 'all', label: `All (${tasks.length})` },
          { id: 'todo', label: 'To do' },
          { id: 'doing', label: 'In progress' },
          { id: 'done', label: 'Done' },
          ...projects.map(p => ({ id: p.id, label: p.name }))
        ].map(f => (
          <button key={f.id} className={`pill ${filter === f.id ? 'active' : ''}`} onClick={() => setFilter(f.id)}>
            {f.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: 'var(--ink4)' }}>Sort:</span>
          {['urgency', 'due', 'title'].map(s => (
            <button key={s} className={`pill btn-sm ${sortBy === s ? 'active' : ''}`} onClick={() => setSortBy(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-emoji">🔍</div>
          <div className="empty-title">Nothing here</div>
          <div className="empty-sub">Try a different filter.</div>
        </div>
      ) : (
        <div className={taskStyle === 'cards' ? 'task-cards' : 'task-list'}>
          {filtered.map(t => <TaskItem key={t.id} task={t} project={getProject(t.projectId)} {...taskProps} cardMode={taskStyle === 'cards'} />)}
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR VIEW ─────────────────────────────────────────────────────────────
function CalendarView({ tasks, projects, onSelect }) {
  const [month, setMonth] = useState(3);
  const [year, setYear]   = useState(2026);
  const todayStr = CADENCE_TODAY.toISOString().split('T')[0];

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames  = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayNames    = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const getProject = (id) => projects.find(p => p.id === id);

  // Gather all events per date: tasks + milestones + deadlines
  const eventsByDate = useMemo(() => {
    const map = {};
    const add = (date, ev) => { if (!map[date]) map[date] = []; map[date].push(ev); };

    tasks.forEach(t => {
      if (t.due) add(t.due, { type: 'task', task: t });
    });
    projects.forEach(p => {
      if (p.deadline) add(p.deadline, { type: 'deadline', project: p, label: p.deadlineLabel || 'Deadline' });
      (p.milestones || []).forEach(m => {
        if (m.date) add(m.date, { type: 'milestone', project: p, label: m.title, done: m.done });
      });
    });
    return map;
  }, [tasks, projects]);

  const prevMonth = () => month === 0 ? (setMonth(11), setYear(y => y-1)) : setMonth(m => m-1);
  const nextMonth = () => month === 11 ? (setMonth(0), setYear(y => y+1)) : setMonth(m => m+1);

  // cells: null for blanks, number for days
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];

  // Legend
  const legend = projects.map(p => ({
    color: p.color, name: p.name,
    count: tasks.filter(t => t.projectId === p.id && t.due &&
      new Date(t.due).getMonth() === month && new Date(t.due).getFullYear() === year).length
  })).filter(l => l.count > 0);

  return (
    <div className="fade-in">
      {/* Header row */}
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
        <button className="btn btn-ghost btn-sm" onClick={prevMonth}>←</button>
        <button className="btn btn-ghost btn-sm" onClick={nextMonth}>→</button>
        <span style={{ fontFamily:'var(--serif)', fontSize:24, letterSpacing:'-.3px' }}>
          {monthNames[month]} <span style={{ color:'var(--ink4)', fontWeight:400 }}>{year}</span>
        </span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft:'auto' }}
          onClick={() => { setMonth(3); setYear(2026); }}>Today</button>
      </div>

      {/* Legend */}
      {legend.length > 0 && (
        <div style={{ display:'flex', gap:14, marginBottom:16, flexWrap:'wrap' }}>
          {legend.map(l => (
            <span key={l.name} style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink3)' }}>
              <span style={{ width:8, height:8, borderRadius:'50%', background:l.color, display:'inline-block' }} />
              {l.name} <span style={{ color:'var(--ink4)' }}>({l.count})</span>
            </span>
          ))}
          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink3)' }}>
            <span style={{ width:8, height:8, borderRadius:2, background:'var(--red)', display:'inline-block' }} />
            Deadlines
          </span>
          <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:12, color:'var(--ink3)' }}>
            <span style={{ width:8, height:8, borderRadius:2, background:'var(--yellow)', display:'inline-block' }} />
            Milestones
          </span>
        </div>
      )}

      {/* Grid */}
      <div style={{
        display:'grid', gridTemplateColumns:'repeat(7,1fr)',
        border:'1px solid var(--border)', borderRadius:'var(--r2)', overflow:'hidden',
        background:'var(--border)', gap:'1px'
      }}>
        {/* Day headers */}
        {dayNames.map(d => (
          <div key={d} style={{
            background:'var(--bg2)', textAlign:'center', padding:'10px 4px',
            fontSize:11, fontWeight:700, letterSpacing:'.06em',
            textTransform:'uppercase', color:'var(--ink4)'
          }}>{d}</div>
        ))}

        {/* Day cells */}
        {cells.map((day, i) => {
          if (!day) return (
            <div key={`b${i}`} style={{ background:'var(--bg2)', minHeight:110, opacity:.5 }} />
          );

          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const evs     = eventsByDate[dateStr] || [];
          const isToday = dateStr === todayStr;
          const taskEvs = evs.filter(e => e.type === 'task');
          const specEvs = evs.filter(e => e.type !== 'task'); // milestones + deadlines

          return (
            <div key={dateStr} style={{
              background: isToday ? 'var(--accent-bg)' : 'var(--surface)',
              minHeight: 110,
              padding: '8px 8px 6px',
              cursor: evs.length ? 'pointer' : 'default',
              display:'flex', flexDirection:'column', gap:3,
              transition:'background .1s',
            }}
              onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--bg2)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'var(--accent-bg)' : 'var(--surface)'; }}
            >
              {/* Day number */}
              <div style={{
                fontSize:13, fontWeight:700,
                color: isToday ? 'var(--accent)' : 'var(--ink3)',
                width:24, height:24, borderRadius:'50%',
                background: isToday ? 'var(--accent)' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
                color: isToday ? 'white' : 'var(--ink3)',
                marginBottom:2, flexShrink:0
              }}>{day}</div>

              {/* Special events first (deadline/milestone) */}
              {specEvs.map((e, si) => (
                <div key={si} style={{
                  display:'flex', alignItems:'center', gap:4,
                  padding:'2px 5px', borderRadius:4,
                  background: e.type==='deadline' ? 'var(--red-bg)' : 'var(--yellow-bg)',
                  cursor:'default'
                }}>
                  <span style={{
                    width:6, height:6, borderRadius:2, flexShrink:0,
                    background: e.type==='deadline' ? 'var(--red)' : 'var(--yellow)'
                  }} />
                  <span style={{
                    fontSize:10, fontWeight:600,
                    color: e.type==='deadline' ? 'var(--red)' : 'var(--yellow)',
                    whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                  }}>{e.label}</span>
                </div>
              ))}

              {/* Task dots */}
              {taskEvs.slice(0,4).map((e, ti) => {
                const proj = getProject(e.task.projectId);
                const done = e.task.status === 'done';
                return (
                  <div key={ti}
                    onClick={() => onSelect(e.task)}
                    style={{
                      display:'flex', alignItems:'center', gap:5,
                      padding:'2px 5px', borderRadius:4, cursor:'pointer',
                      background: 'transparent',
                      opacity: done ? .45 : 1,
                    }}
                    onMouseEnter={ev => ev.currentTarget.style.background = 'var(--bg3)'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{
                      width:7, height:7, borderRadius:'50%', flexShrink:0,
                      background: proj?.color || 'var(--ink4)',
                      outline: done ? '1.5px solid var(--green)' : 'none',
                    }} />
                    <span style={{
                      fontSize:11, color:'var(--ink2)', lineHeight:1.35,
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>{e.task.title}</span>
                  </div>
                );
              })}
              {taskEvs.length > 4 && (
                <div style={{ fontSize:10, color:'var(--ink4)', paddingLeft:5 }}>
                  +{taskEvs.length-4} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PROJECTS VIEW ─────────────────────────────────────────────────────────────
function ProjectsView({ tasks, projects, onCheck, onStar, onSubtaskCheck, onSelect, onNewProject }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id);
  const [board, setBoard] = useState(true);

  const proj    = projects.find(p => p.id === selectedId);
  const ptasks  = tasks.filter(t => t.projectId === selectedId);
  const todo    = ptasks.filter(t => t.status === 'todo').sort((a,b) => urgencyScore(b)-urgencyScore(a));
  const doing   = ptasks.filter(t => t.status === 'doing').sort((a,b) => urgencyScore(b)-urgencyScore(a));
  const done    = ptasks.filter(t => t.status === 'done');
  const overdue = ptasks.filter(t => isOverdue(t));
  const pct     = ptasks.length ? Math.round((done.length/ptasks.length)*100) : 0;
  const daysLeft = proj?.deadline ? daysUntil(proj.deadline) : null;

  const R = 30, circ = 2*Math.PI*R;
  const taskActs = { onCheck, onStar, onSubtaskCheck, onSelect };

  return (
    <div className="proj-layout fade-in">

      {/* ── Rail ── */}
      <aside className="proj-rail">
        <div className="proj-rail-label" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          Projects
          <button onClick={onNewProject} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink4)', fontSize:18, lineHeight:1, padding:'0 2px' }} title="New project">+</button>
        </div>
        {projects.map(p => {
          const pt = tasks.filter(t => t.projectId === p.id);
          const pp = pt.length ? Math.round((pt.filter(t=>t.status==='done').length/pt.length)*100) : 0;
          const sel = selectedId === p.id;
          return (
            <button key={p.id}
              className={`proj-rail-btn ${sel?'sel':''}`}
              style={sel ? { borderLeftColor: p.color } : {}}
              onClick={() => setSelectedId(p.id)}>
              <span className="proj-rail-icon" style={{ background: p.color+'22' }}>{p.icon}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div className="proj-rail-name">{p.name}</div>
                <div className="proj-rail-bar">
                  <div className="proj-rail-fill" style={{ width:`${pp}%`, background: p.color }} />
                </div>
              </div>
              <span className="proj-rail-pct">{pp}%</span>
            </button>
          );
        })}
      </aside>

      {/* ── Detail ── */}
      {proj && (
        <div className="proj-detail">

          {/* Banner */}
          <div className="proj-banner">
            <div className="proj-banner-accent" style={{ background: proj.color }} />
            <div className="proj-banner-top">
              <div className="proj-banner-icon" style={{ background: proj.color+'22' }}>{proj.icon}</div>
              <div className="proj-banner-text">
                <div className="proj-banner-name">{proj.name}</div>
                {proj.description && <div className="proj-banner-desc">{proj.description}</div>}
              </div>
              {daysLeft !== null && (
                <div className="proj-banner-right">
                  <div className="proj-banner-days"
                    style={{ color: daysLeft<=5 ? 'var(--red)' : proj.color }}>
                    {daysLeft}
                  </div>
                  <div className="proj-banner-days-label">days left</div>
                  <div className="proj-banner-days-sub">{proj.deadlineLabel}</div>
                </div>
              )}
            </div>
          </div>

          {/* Stats bar */}
          <div className="proj-statsbar">
            {[
              { n: ptasks.length,  l: 'Total',       c: 'var(--ink)' },
              { n: todo.length,    l: 'To do',        c: 'var(--ink)' },
              { n: doing.length,   l: 'In progress',  c: doing.length  ? 'var(--accent2)' : 'var(--ink)' },
              { n: done.length,    l: 'Done',          c: done.length   ? 'var(--green)'   : 'var(--ink)' },
              { n: overdue.length, l: 'Overdue',       c: overdue.length ? 'var(--red)'    : 'var(--ink)' },
            ].map(s => (
              <div key={s.l} className="proj-stat">
                <div className="proj-stat-n" style={{ color: s.c }}>{s.n}</div>
                <div className="proj-stat-l">{s.l}</div>
              </div>
            ))}
          </div>

          {/* Body: main + aside */}
          <div className="proj-body">

            {/* Main: tasks */}
            <div className="proj-main">
              <div style={{ display:'flex', alignItems:'center', marginBottom:16, gap:10 }}>
                <div className="proj-slabel" style={{ margin:0 }}>Tasks</div>
                <div className="view-toggle" style={{ marginLeft:'auto' }}>
                  <button className={board?'on':''} onClick={()=>setBoard(true)}>⣿ Board</button>
                  <button className={!board?'on':''} onClick={()=>setBoard(false)}>≡ List</button>
                </div>
              </div>

              {board ? (
                <div className="kanban">
                  {[
                    { label:'To do',       items:todo,  dot:'var(--ink4)',   key:'todo'  },
                    { label:'In progress', items:doing, dot:'var(--accent2)',key:'doing' },
                    { label:'Done',        items:done,  dot:'var(--green)',  key:'done'  },
                  ].map(col => (
                    <div key={col.key} className="kanban-col">
                      <div className="kanban-hd">
                        <div className="kanban-dot" style={{ background:col.dot }} />
                        <span className="kanban-htitle">{col.label}</span>
                        <span className="kanban-hcount">{col.items.length}</span>
                      </div>
                      <div className="kanban-body">
                        {col.items.map(t => (
                          <div key={t.id}
                            className={`kanban-card ${t.status==='done'?'is-done':''}`}
                            onClick={() => onSelect(t)}>
                            <div className="kanban-card-bar" style={{ background:weightColor(t.weight||5) }} />
                            <div className="kanban-card-body">
                              <div style={{ display:'flex', alignItems:'flex-start', gap:7 }}>
                                <button className={`check-btn ${t.status}`} style={{ flexShrink:0, marginTop:1 }}
                                  onClick={e=>{ e.stopPropagation(); onCheck(t.id); }} />
                                <div className="kanban-card-title">{t.title}</div>
                              </div>
                              <div className="kanban-card-meta">
                                {t.due && (
                                  <span className={`task-due ${isOverdue(t)?'overdue':daysUntil(t.due)===0?'today-due':daysUntil(t.due)<=3?'soon':'later'}`}>
                                    {formatDue(t.due)}
                                  </span>
                                )}
                                <span className={`task-priority ${t.priority}`}>{t.priority}</span>
                                {t.subtasks?.length>0 && (
                                  <span style={{ fontSize:11, color:'var(--ink4)' }}>
                                    {t.subtasks.filter(s=>s.done).length}/{t.subtasks.length}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {col.items.length===0 && <div className="kanban-empty">Empty</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                [{ items:todo,label:'To do'},{items:doing,label:'In progress'},{items:done,label:'Done'}]
                  .filter(s=>s.items.length>0)
                  .map(s=>(
                    <div key={s.label}>
                      <div className="section-hd"><span className="section-title">{s.label}</span><span className="section-count">{s.items.length}</span></div>
                      <div className="task-list">
                        {s.items.map(t=><TaskItem key={t.id} task={t} project={proj} {...taskActs} showProject={false} />)}
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Aside */}
            <div className="proj-aside">

              {/* Progress ring */}
              <div className="proj-ring-wrap">
                <div className="proj-ring-label">Progress</div>
                <svg width={76} height={76} style={{ transform:'rotate(-90deg)' }}>
                  <circle cx={38} cy={38} r={R} fill="none" stroke="var(--bg3)" strokeWidth={6} />
                  <circle cx={38} cy={38} r={R} fill="none" stroke={proj.color} strokeWidth={6}
                    strokeDasharray={`${circ*(pct/100)} ${circ}`} strokeLinecap="round"
                    style={{ transition:'stroke-dasharray .5s ease' }} />
                </svg>
                <div className="proj-ring-pct" style={{ color:proj.color }}>{pct}% complete</div>
                <div style={{ fontSize:11, color:'var(--ink4)' }}>{done.length} of {ptasks.length} tasks done</div>
              </div>

              {/* Milestones */}
              {proj.milestones?.length>0 && (
                <>
                  <div className="proj-slabel">Milestones</div>
                  <div className="ms-list">
                    {proj.milestones.map(m => {
                      const diff = daysUntil(m.date);
                      const past = diff!==null && diff<0 && !m.done;
                      return (
                        <div key={m.id} className={`ms-item ${m.done?'ms-done':''}`}>
                          <div className="ms-dot" style={{
                            background: m.done ? 'var(--green)' : past ? 'var(--red)' : proj.color
                          }}>
                            {m.done ? '✓' : ''}
                          </div>
                          <div className="ms-body">
                            <div className="ms-title">{m.title}</div>
                            <div className="ms-date" style={{ color: past?'var(--red)':'var(--ink4)' }}>
                              {m.done ? 'Completed' : formatDue(m.date)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Target */}
              {proj.targetScore && (
                <div style={{ marginTop:16, padding:'12px 14px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'var(--r2)' }}>
                  <div style={{ fontSize:10, fontWeight:600, letterSpacing:'.06em', textTransform:'uppercase', color:'var(--ink4)', marginBottom:4 }}>Target score</div>
                  <div style={{ fontFamily:'var(--serif)', fontSize:32, color:proj.color, lineHeight:1 }}>{proj.targetScore}</div>
                  <div style={{ fontSize:11, color:'var(--ink4)', marginTop:2 }}>Band score</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function _OldProjectsView_DELETED({ tasks, projects, onCheck, onStar, onSubtaskCheck, onSelect, taskStyle }) {
  const [selectedId, setSelectedId] = useState(projects[0]?.id);
  const [kanbanView, setKanbanView] = useState(true);
  const getProject = (id) => projects.find(p => p.id === id);

  const proj = getProject(selectedId);
  const ptasks = tasks.filter(t => t.projectId === selectedId);
  const taskProps = { onCheck, onStar, onSubtaskCheck, onSelect };

  const todo   = ptasks.filter(t => t.status === 'todo').sort((a,b) => urgencyScore(b) - urgencyScore(a));
  const doing  = ptasks.filter(t => t.status === 'doing').sort((a,b) => urgencyScore(b) - urgencyScore(a));
  const done   = ptasks.filter(t => t.status === 'done');
  const pct    = ptasks.length > 0 ? Math.round((done.length / ptasks.length) * 100) : 0;
  const overdue = ptasks.filter(t => isOverdue(t));
  const daysLeft = proj?.deadline ? daysUntil(proj.deadline) : null;

  // Progress ring
  const R = 28, C = 2 * Math.PI * R;
  const dash = C * (pct / 100);

  return (
    <div className="fade-in proj-layout">
      {/* ── Left rail: project list ── */}
      <aside className="proj-rail">
        <div className="proj-rail-label">Projects</div>
        {projects.map(p => {
          const pt = tasks.filter(t => t.projectId === p.id);
          const pd = pt.filter(t => t.status === 'done').length;
          const pp = pt.length > 0 ? Math.round((pd / pt.length) * 100) : 0;
          const active = selectedId === p.id;
          return (
            <button key={p.id} className={`proj-rail-item ${active ? 'active' : ''}`}
              style={active ? { borderLeftColor: p.color } : {}}
              onClick={() => setSelectedId(p.id)}>
              <span className="proj-rail-icon" style={{ background: p.color + '22' }}>{p.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="proj-rail-name">{p.name}</div>
                <div className="project-progress-bar" style={{ marginTop: 5 }}>
                  <div className="project-progress-fill" style={{ width: `${pp}%`, background: p.color }} />
                </div>
              </div>
              <span className="proj-rail-pct">{pp}%</span>
            </button>
          );
        })}
      </aside>

      {/* ── Right detail ── */}
      {proj && (
        <div className="proj-detail">

          {/* Hero */}
          <div className="proj-hero" style={{ borderColor: proj.color + '44', background: proj.color + '0d' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
              {/* Progress ring */}
              <div style={{ flexShrink: 0, position: 'relative', width: 72, height: 72 }}>
                <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="36" cy="36" r={R} fill="none" stroke="var(--bg3)" strokeWidth="5" />
                  <circle cx="36" cy="36" r={R} fill="none" stroke={proj.color} strokeWidth="5"
                    strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }} />
                </svg>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 13, fontWeight: 600, color: proj.color
                }}>{pct}%</div>
              </div>

              {/* Title + desc */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{proj.icon}</span>
                  <h2 className="proj-hero-title">{proj.name}</h2>
                </div>
                {proj.description && (
                  <p className="proj-hero-desc">{proj.description}</p>
                )}
              </div>

              {/* Deadline */}
              {daysLeft !== null && (
                <div className="proj-deadline" style={{ borderColor: proj.color + '44' }}>
                  <div className="proj-deadline-num" style={{ color: daysLeft <= 5 ? 'var(--red)' : proj.color }}>
                    {daysLeft}
                  </div>
                  <div className="proj-deadline-label">days left</div>
                  <div className="proj-deadline-sub">{proj.deadlineLabel}</div>
                </div>
              )}
            </div>

            {/* Stats row */}
            <div className="proj-stats-row">
              {[
                { label: 'Total', val: ptasks.length },
                { label: 'To do', val: todo.length },
                { label: 'In progress', val: doing.length, accent: doing.length > 0 },
                { label: 'Done', val: done.length, green: true },
                { label: 'Overdue', val: overdue.length, red: overdue.length > 0 },
              ].map(s => (
                <div key={s.label} className="proj-stat-pill">
                  <span className="proj-stat-val" style={{
                    color: s.red ? 'var(--red)' : s.green && s.val > 0 ? 'var(--green)' : s.accent ? 'var(--accent2)' : 'var(--ink)'
                  }}>{s.val}</span>
                  <span className="proj-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Milestones */}
          {proj.milestones && proj.milestones.length > 0 && (
            <div className="proj-milestones">
              <div className="proj-section-label">Milestones</div>
              <div className="proj-milestone-list">
                {proj.milestones.map((m, i) => {
                  const diff = daysUntil(m.date);
                  const past = diff !== null && diff < 0;
                  return (
                    <div key={m.id} className={`proj-milestone ${m.done ? 'done' : ''} ${past && !m.done ? 'overdue' : ''}`}>
                      <div className={`proj-milestone-dot ${m.done ? 'done' : past ? 'overdue' : ''}`}
                        style={{ background: m.done ? 'var(--green)' : past ? 'var(--red)' : proj.color }} />
                      {i < proj.milestones.length - 1 && <div className="proj-milestone-line" />}
                      <div className="proj-milestone-body">
                        <span className="proj-milestone-title">{m.title}</span>
                        <span className="proj-milestone-date" style={{
                          color: past && !m.done ? 'var(--red)' : 'var(--ink4)'
                        }}>
                          {m.done ? 'Done' : formatDue(m.date)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0 14px' }}>
            <div className="proj-section-label" style={{ margin: 0 }}>Tasks</div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
              <button className={`btn btn-ghost btn-sm ${kanbanView ? 'active' : ''}`}
                style={{ padding: '4px 10px' }} onClick={() => setKanbanView(true)}>
                ⣿ Board
              </button>
              <button className={`btn btn-ghost btn-sm ${!kanbanView ? 'active' : ''}`}
                style={{ padding: '4px 10px' }} onClick={() => setKanbanView(false)}>
                ≡ List
              </button>
            </div>
          </div>

          {/* Kanban board */}
          {kanbanView ? (
            <div className="proj-kanban">
              {[
                { key: 'todo',  label: 'To do',       items: todo,  color: 'var(--ink4)' },
                { key: 'doing', label: 'In progress',  items: doing, color: 'var(--accent2)' },
                { key: 'done',  label: 'Done',          items: done,  color: 'var(--green)' },
              ].map(col => (
                <div key={col.key} className="proj-kanban-col">
                  <div className="proj-kanban-hd">
                    <span className="proj-kanban-dot" style={{ background: col.color }} />
                    <span className="proj-kanban-title">{col.label}</span>
                    <span className="proj-kanban-count">{col.items.length}</span>
                  </div>
                  <div className="proj-kanban-body">
                    {col.items.map(t => (
                      <div key={t.id}
                        className={`proj-kanban-card ${t.status === 'done' ? 'done-item' : ''}`}
                        onClick={() => { onSelect(t); }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                          <button className={`check-btn ${t.status}`}
                            style={{ flexShrink: 0, marginTop: 1 }}
                            onClick={e => { e.stopPropagation(); onCheck(t.id); }} />
                          <div style={{ flex: 1 }}>
                            <div className="task-title">{t.title}</div>
                            <div className="task-meta" style={{ marginTop: 4 }}>
                              {t.due && <span className={`task-due ${isOverdue(t) ? 'overdue' : daysUntil(t.due) === 0 ? 'today-due' : daysUntil(t.due) <= 3 ? 'soon' : 'later'}`}>
                                {formatDue(t.due)}
                              </span>}
                              <span className={`task-priority ${t.priority}`}>{t.priority}</span>
                              {t.subtasks?.length > 0 && (
                                <span style={{ fontSize: 11, color: 'var(--ink4)' }}>
                                  {t.subtasks.filter(s => s.done).length}/{t.subtasks.length}
                                </span>
                              )}
                            </div>
                            {t.notes && <div className="task-notes" style={{ marginTop: 6, fontSize: 11.5 }}>{t.notes}</div>}
                          </div>
                          <div style={{
                            width: 3, alignSelf: 'stretch', borderRadius: 2,
                            background: weightColor(t.weight || 5), flexShrink: 0, minHeight: 16
                          }} />
                        </div>
                      </div>
                    ))}
                    {col.items.length === 0 && (
                      <div style={{ padding: '20px 12px', textAlign: 'center', fontSize: 12, color: 'var(--ink4)' }}>
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List view */
            <>
              {[
                { items: todo,  label: 'To do' },
                { items: doing, label: 'In progress' },
                { items: done,  label: 'Done' },
              ].filter(s => s.items.length > 0).map(s => (
                <div key={s.label}>
                  <div className="section-hd"><span className="section-title">{s.label}</span><span className="section-count">{s.items.length}</span></div>
                  <div className="task-list">
                    {s.items.map(t => <TaskItem key={t.id} task={t} project={proj} {...taskProps} showProject={false} />)}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── ARCHIVE VIEW ──────────────────────────────────────────────────────────────
function ArchiveView({ tasks, projects, onSelect }) {
  const done = tasks.filter(t => t.status === 'done');
  const getProject = (id) => projects.find(p => p.id === id);

  if (done.length === 0) {
    return (
      <div className="empty-state fade-in">
        <div className="empty-emoji">📦</div>
        <div className="empty-title">Archive is empty</div>
        <div className="empty-sub">Completed tasks will appear here.</div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 16 }}>
        <span style={{ fontFamily: 'var(--serif)', fontSize: 14, color: 'var(--ink3)' }}>
          {done.length} task{done.length !== 1 ? 's' : ''} completed
        </span>
      </div>
      <div className="task-list">
        {done.map(t => {
          const proj = getProject(t.projectId);
          return (
            <div key={t.id} className="task-item done-item" onClick={() => onSelect(t)}>
              <div className="weight-bar" style={{ background: 'var(--ink4)' }} />
              <div className="check-btn done" />
              <div className="task-body">
                <div className="task-title">{t.title}</div>
                <div className="task-meta">
                  {proj && <span className="task-project" style={{ color: proj.color }}>{proj.name}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { TodayView, UpcomingView, AllTasksView, CalendarView, ProjectsView, ArchiveView });
