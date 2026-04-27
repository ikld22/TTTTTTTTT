// app.jsx — main Cadence app shell

const { useState, useEffect, useCallback, useRef } = React;

const NAV_ITEMS = [
  { id: 'today',    label: 'Today',    icon: '◎' },
  { id: 'upcoming', label: 'Upcoming', icon: '◷' },
  { id: 'all',      label: 'All Tasks',icon: '≡' },
  { id: 'calendar', label: 'Calendar', icon: '▦' },
  { id: 'projects', label: 'Projects', icon: '◈' },
  { id: 'archive',  label: 'Archive',  icon: '▣' },
];

const VIEW_TITLES = {
  today:    'Today',
  upcoming: 'Upcoming',
  all:      'All Tasks',
  calendar: 'Calendar',
  projects: 'Projects',
  archive:  'Archive',
};

function CadenceApp({ tweakValues }) {
  const { theme, density, taskStyle, sidebar } = tweakValues;

  // ─── State ─────────────────────────────────────────────────────────────────
  const [{ tasks, projects }, setState] = useState(() => loadState());
  const [view, setView] = useState('today');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);

  // Persist to localStorage whenever tasks/projects change
  useEffect(() => { saveState(tasks, projects); }, [tasks, projects]);

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'light' ? '' : theme);
    document.documentElement.style.setProperty(
      '--density-pad', density === 'compact' ? '24px' : '32px'
    );
  }, [theme, density]);

  // Keyboard shortcut: N = new task, Escape = close
  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') setShowQuickAdd(true);
      if (e.key === 'Escape') { setShowQuickAdd(false); setSelectedTask(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // ─── Mutation helpers ───────────────────────────────────────────────────────
  const updateTasks = useCallback((fn) => {
    setState(prev => {
      const next = fn(prev.tasks);
      return { ...prev, tasks: next };
    });
  }, []);

  const handleCheck = useCallback((id) => {
    updateTasks(tasks => tasks.map(t => {
      if (t.id !== id) return t;
      const cycle = { todo: 'doing', doing: 'done', done: 'todo' };
      return { ...t, status: cycle[t.status] };
    }));
    setSelectedTask(prev => {
      if (!prev || prev.id !== id) return prev;
      const cycle = { todo: 'doing', doing: 'done', done: 'todo' };
      return { ...prev, status: cycle[prev.status] };
    });
  }, [updateTasks]);

  const handleStar = useCallback((id) => {
    updateTasks(tasks => tasks.map(t => t.id === id ? { ...t, today: !t.today } : t));
    setSelectedTask(prev => prev?.id === id ? { ...prev, today: !prev.today } : prev);
  }, [updateTasks]);

  const handleSubtaskCheck = useCallback((taskId, subtaskId) => {
    updateTasks(tasks => tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        subtasks: t.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
      };
    }));
    setSelectedTask(prev => {
      if (!prev || prev.id !== taskId) return prev;
      return {
        ...prev,
        subtasks: prev.subtasks.map(st => st.id === subtaskId ? { ...st, done: !st.done } : st)
      };
    });
  }, [updateTasks]);

  const handleAddTask = useCallback((task) => {
    updateTasks(tasks => [task, ...tasks]);
  }, [updateTasks]);

  const handleAddProject = useCallback((project) => {
    setState(prev => ({ ...prev, projects: [...prev.projects, project] }));
  }, []);

  const handleSelect = useCallback((task) => {
    setSelectedTask(prev => prev?.id === task.id ? null : task);
  }, []);

  // Keep selectedTask in sync with tasks state
  useEffect(() => {
    if (!selectedTask) return;
    const fresh = tasks.find(t => t.id === selectedTask.id);
    if (fresh) setSelectedTask(fresh);
  }, [tasks]);

  // ─── Counts for badges ──────────────────────────────────────────────────────
  const todayCount   = tasks.filter(t => t.today && t.status !== 'done').length;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  const viewProps = {
    tasks, projects,
    onCheck: handleCheck,
    onStar: handleStar,
    onSubtaskCheck: handleSubtaskCheck,
    onSelect: handleSelect,
    onNewProject: () => setShowAddProject(true),
    taskStyle,
  };

  const sidebarIcons = sidebar === 'icons';

  return (
    <div className="app-shell" style={{ '--sidebar-w': sidebarIcons ? '56px' : '240px' }}>
      {/* Sidebar */}
      <nav className={`sidebar ${sidebarIcons ? 'icons' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark"><span>C</span></div>
          {!sidebarIcons && <span className="logo-text">Cadence</span>}
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">Views</div>
          {NAV_ITEMS.map(item => {
            const badge = item.id === 'today' ? (todayCount + overdueCount) : 0;
            return (
              <button
                key={item.id}
                className={`nav-item ${view === item.id ? 'active' : ''}`}
                onClick={() => { setView(item.id); setSelectedTask(null); }}
                title={sidebarIcons ? item.label : ''}
              >
                <span style={{ fontSize: 15, width: 18, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {badge > 0 && <span className="nav-badge">{badge}</span>}
              </button>
            );
          })}

          <div className="nav-section" style={{ marginTop: 20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            Projects
            <button onClick={() => setShowAddProject(true)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--ink4)', fontSize:16, lineHeight:1, padding:'0 2px' }} title="New project">+</button>
          </div>
          {projects.map(p => (
            <button
              key={p.id}
              className={`nav-item`}
              onClick={() => { setView('projects'); setSelectedTask(null); }}
              title={sidebarIcons ? p.name : ''}
            >
              <span className="nav-project-dot" style={{ background: p.color }} />
              <span className="nav-label">{p.name}</span>
              <span className="nav-label" style={{ color: 'var(--ink4)', fontSize: 11, marginLeft: 'auto' }}>
                {tasks.filter(t => t.projectId === p.id && t.status !== 'done').length}
              </span>
            </button>
          ))}
        </div>

        <div className="sidebar-bottom">
          <button
            className="nav-item"
            onClick={() => setShowQuickAdd(true)}
            title={sidebarIcons ? 'New task (N)' : ''}
          >
            <span style={{ fontSize: 16, width: 18, textAlign: 'center', flexShrink: 0 }}>+</span>
            <span className="nav-label">New task</span>
            <kbd className="nav-label" style={{ marginLeft: 'auto' }}>N</kbd>
          </button>
        </div>
      </nav>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <div className="topbar-title">{VIEW_TITLES[view]}</div>
          <div className="topbar-actions">
            {overdueCount > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'var(--red)',
                background: 'var(--red-bg)', padding: '3px 10px',
                borderRadius: 20, cursor: 'pointer'
              }} onClick={() => setView('all')}>
                {overdueCount} overdue
              </span>
            )}
            <button className="btn btn-primary btn-sm" onClick={() => setShowQuickAdd(true)}>
              + New task
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <div className="view-body" style={{
              padding: view === 'projects' ? 0 : density === 'compact' ? '20px 24px' : '32px 36px',
              overflow: view === 'projects' ? 'hidden' : 'auto',
            }}>
            {view === 'today'    && <TodayView    {...viewProps} />}
            {view === 'upcoming' && <UpcomingView  {...viewProps} />}
            {view === 'all'      && <AllTasksView  {...viewProps} />}
            {view === 'calendar' && <CalendarView  {...viewProps} />}
            {view === 'projects' && <ProjectsView  {...viewProps} />}
            {view === 'archive'  && <ArchiveView   {...viewProps} />}
          </div>

          {/* Detail panel */}
          {selectedTask && (
            <DetailPanel
              task={selectedTask}
              project={projects.find(p => p.id === selectedTask.projectId)}
              onClose={() => setSelectedTask(null)}
              onCheck={handleCheck}
              onStar={handleStar}
              onSubtaskCheck={handleSubtaskCheck}
            />
          )}
        </div>
      </div>

      {/* Quick-add modal */}
      {showQuickAdd && (
        <QuickAddModal
          projects={projects}
          onAdd={handleAddTask}
          onClose={() => setShowQuickAdd(false)}
        />
      )}

      {/* Add project modal */}
      {showAddProject && (
        <AddProjectModal
          onAdd={handleAddProject}
          onClose={() => setShowAddProject(false)}
        />
      )}
    </div>
  );
}

// ─── Root with tweaks ──────────────────────────────────────────────────────────
function Root() {
  const [tweakValues, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "theme": "light",
    "density": "cozy",
    "taskStyle": "list",
    "sidebar": "full"
  }/*EDITMODE-END*/);

  return (
    <>
      <CadenceApp tweakValues={tweakValues} />
      <TweaksPanel>
        <TweakSection label="Appearance" />
        <TweakRadio label="Theme" value={tweakValues.theme} options={["light","dark","ink"]} onChange={(v) => setTweak('theme', v)} />
        <TweakRadio label="Density" value={tweakValues.density} options={["cozy","compact"]} onChange={(v) => setTweak('density', v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Tasks" value={tweakValues.taskStyle} options={["list","cards"]} onChange={(v) => setTweak('taskStyle', v)} />
        <TweakRadio label="Sidebar" value={tweakValues.sidebar} options={["full","icons"]} onChange={(v) => setTweak('sidebar', v)} />
        <TweakSection label="Data" />
        <TweakButton label="Reset to defaults" onClick={() => {
          localStorage.removeItem('cadence_state');
          window.location.reload();
        }} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
