import { useMemo, useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Button, IconButton, ProgressBar } from '../components/ui/primitives.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { addStickyNote, addTask, deleteStickyNote, deriveDueNotifications, formatDue, isOverdue, moveTask, updateSettings, updateStickyNote, useBoard } from '../store/board-store.js'
import './pages.css';

export function DashboardPage({ onMenu, railOpen }) {
  const { tasks, projects, notes, settings } = useBoard()
  const [noteDraft, setNoteDraft] = useState('')
  const [noteColor, setNoteColor] = useState('butter')
  const [taskDraft, setTaskDraft] = useState('')
  const [taskPriority, setTaskPriority] = useState('medium')
  const activeProjects = projects.filter((p) => !p.archived)
  const total = tasks.length
  const done = tasks.filter((t) => t.status === 'completed').length
  const active = tasks.filter((t) => t.status === 'inprogress').length
  const overdue = tasks.filter(isOverdue).length
  const due = deriveDueNotifications(tasks).slice(0, 4)
  const today = new Date()
  const todayKey = toDateKey(today)
  const week = makeWeek(today)

  const upcoming = useMemo(() => [...tasks]
    .filter((task) => task.status !== 'completed')
    .sort((a, b) => (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'))
    .slice(0, 4), [tasks])
  const incomplete = tasks.filter((task) => task.status !== 'completed')
  const focusTask = incomplete.find((task) => task.id === settings.focusTaskId) || upcoming[0] || null

  const addNote = (event) => {
    event.preventDefault()
    if (addStickyNote(noteDraft, noteColor)) setNoteDraft('')
  }

  const addQuickTask = (event) => {
    event.preventDefault()
    if (!taskDraft.trim()) return
    const task = addTask({ title: taskDraft, description: '', priority: taskPriority, due: '', status: 'todo', projectId: null })
    updateSettings({ focusTaskId: task.id })
    setTaskDraft('')
  }

  const rotateFocus = () => {
    if (incomplete.length < 2) return
    const currentIndex = incomplete.findIndex((task) => task.id === focusTask?.id)
    updateSettings({ focusTaskId: incomplete[(currentIndex + 1) % incomplete.length].id })
  }

  return (
    <AppShell
      railOpen={railOpen}
      onMenu={onMenu}
      title="Your workspace"
      subtitle={today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
      actions={<Button icon="plus" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'tasks' }))}>New task</Button>}
    >
      <div className="dashboard-bento">
        <section className="bento-card dash-intro">
          <div className="eyebrow"><span /> Today&apos;s pace</div>
          <h2>{total ? `${Math.max(total - done, 0)} things are still in motion.` : 'A clear desk is a good place to start.'}</h2>
          <p>{total ? `${done} of ${total} tasks are complete. Keep the next step small and visible.` : 'Create a project, add one task, and give the week a little shape.'}</p>
          <div className="intro-actions">
            <Button icon="kanban" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'kanban' }))}>Open board</Button>
            <button type="button" className="text-action" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'projects' }))}>Manage projects <Icon name="chevronRight" size={15} /></button>
          </div>
          <div className="intro-metrics" aria-label="Workspace summary">
            <div><strong>{active}</strong><span>in progress</span></div>
            <div><strong>{overdue}</strong><span>need attention</span></div>
            <div><strong>{activeProjects.length}</strong><span>open projects</span></div>
          </div>
        </section>

        <section className="bento-card dash-week" aria-label="This week">
          <header className="bento-head">
            <div><span className="bento-kicker">Calendar</span><h2>This week</h2></div>
            <Icon name="calendar" size={18} />
          </header>
          <div className="week-strip">
            {week.map((day) => {
              const count = tasks.filter((task) => task.due === day.key && task.status !== 'completed').length
              return <div key={day.key} className={`week-day${day.key === todayKey ? ' today' : ''}`}><span>{day.label}</span><b>{day.date}</b><i>{count || ''}</i></div>
            })}
          </div>
          <p className="week-caption">{due.length ? `${due.length} deadline${due.length === 1 ? '' : 's'} coming up soon.` : 'Nothing pressing on the horizon.'}</p>
        </section>

        <section className="bento-card dash-focus">
          <header className="bento-head">
            <div><span className="bento-kicker">Right now</span><h2>Focus mode</h2></div>
            <Icon name="activity" size={18} />
          </header>
          {focusTask ? (
            <div className="focus-task">
              <span className={`focus-priority ${focusTask.priority}`} />
              <p className="focus-label">Current task</p>
              <h3>{focusTask.title}</h3>
              <p className="focus-meta">{focusTask.due ? `${formatDue(focusTask.due)} · ` : ''}{focusTask.status === 'inprogress' ? 'In progress' : 'Ready when you are'}</p>
              <div className="focus-actions">
                <button type="button" className="focus-complete" onClick={() => moveTask(focusTask.id, 'completed')}><Icon name="check" size={15} /> Mark done</button>
                {incomplete.length > 1 ? <button type="button" className="focus-switch" onClick={rotateFocus}>Pick another</button> : null}
              </div>
            </div>
          ) : <div className="focus-empty"><Icon name="rocket" size={20} /><p>Add one task below, then make it your focus.</p></div>}
        </section>

        <section className="bento-card dash-agenda">
          <header className="bento-head">
            <div><span className="bento-kicker">Focus list</span><h2>Up next</h2></div>
            <button className="mini-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'tasks' }))}>View all</button>
          </header>
          <div className="agenda-list">
            {upcoming.map((task) => <div className="agenda-row" key={task.id}><span className={`status-mark ${task.priority}`} /><div><strong>{task.title}</strong><span>{task.due ? formatDue(task.due) : 'No date set'}</span></div></div>)}
            {upcoming.length === 0 ? <div className="quiet-state"><Icon name="check" size={18} /> Nothing waiting for you.</div> : null}
          </div>
        </section>

        <section className="bento-card dash-projects">
          <header className="bento-head">
            <div><span className="bento-kicker">Projects</span><h2>In the works</h2></div>
            <button className="mini-link" type="button" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'projects' }))}>See projects</button>
          </header>
          <div className="compact-projects">
            {activeProjects.slice(0, 4).map((project) => {
              const projectTasks = tasks.filter((task) => task.projectId === project.id)
              const projectDone = projectTasks.filter((task) => task.status === 'completed').length
              return <div key={project.id} className="compact-project"><span className="project-dot big" style={{ background: project.color }} /><div><strong>{project.name}</strong><ProgressBar value={projectTasks.length ? projectDone / projectTasks.length : 0} tone={project.color} /></div><span>{projectDone}/{projectTasks.length}</span></div>
            })}
            {activeProjects.length === 0 ? <div className="quiet-state"><Icon name="projects" size={18} /> Create a project to group your work.</div> : null}
          </div>
        </section>

        <section className="bento-card dash-notes">
          <header className="bento-head">
            <div><span className="bento-kicker">Scratchpad</span><h2>Sticky notes</h2></div>
            <Icon name="note" size={18} />
          </header>
          <form className="note-composer" onSubmit={addNote}>
            <textarea value={noteDraft} onChange={(event) => setNoteDraft(event.target.value)} placeholder="Leave yourself a thought…" maxLength={360} aria-label="New sticky note" />
            <div><div className="note-colors" role="radiogroup" aria-label="Sticky note colour">{['butter', 'blush', 'mint', 'lilac'].map((color) => <button key={color} type="button" aria-label={`${color} sticky note`} aria-checked={noteColor === color} role="radio" className={`note-color ${color}${noteColor === color ? ' selected' : ''}`} onClick={() => setNoteColor(color)} />)}</div><Button type="submit" icon="plus" disabled={!noteDraft.trim()}>Add note</Button></div>
          </form>
          <div className="sticky-stack">
            {notes.slice(0, 6).map((note) => <article key={note.id} className={`sticky-note ${note.color || 'butter'}`}><textarea aria-label="Edit sticky note" value={note.body} maxLength={360} onChange={(event) => updateStickyNote(note.id, { body: event.target.value })} /><IconButton icon="x" label="Delete sticky note" onClick={() => deleteStickyNote(note.id)} /></article>)}
            {notes.length === 0 ? <p className="notes-empty">Little reminders, rough ideas, and things you don&apos;t want to lose.</p> : null}
          </div>
        </section>

        <section className="bento-card dash-capture">
          <header className="bento-head">
            <div><span className="bento-kicker">Inbox</span><h2>Quick capture</h2></div>
            <Icon name="inbox" size={18} />
          </header>
          <p className="capture-copy">Get it out of your head. You can add details later.</p>
          <form className="capture-form" onSubmit={addQuickTask}>
            <input value={taskDraft} onChange={(event) => setTaskDraft(event.target.value)} placeholder="What needs doing?" maxLength={100} aria-label="Quick task title" />
            <div className="capture-controls">
              <div className="priority-picker" role="radiogroup" aria-label="Quick task priority">
                {['low', 'medium', 'high'].map((priority) => <button key={priority} type="button" role="radio" aria-checked={taskPriority === priority} className={`priority-choice ${priority}${taskPriority === priority ? ' selected' : ''}`} onClick={() => setTaskPriority(priority)}>{priority}</button>)}
              </div>
              <Button type="submit" icon="plus" disabled={!taskDraft.trim()}>Add task</Button>
            </div>
          </form>
          <div className="capture-foot"><span>{incomplete.length} open task{incomplete.length === 1 ? '' : 's'}</span><button type="button" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: 'tasks' }))}>Open task list <Icon name="chevronRight" size={14} /></button></div>
        </section>
      </div>
    </AppShell>
  )
}

function toDateKey(date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10)
}

function makeWeek(date) {
  const first = new Date(date)
  const day = first.getDay() || 7
  first.setDate(first.getDate() - day + 1)
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(first)
    current.setDate(first.getDate() + index)
    return { key: toDateKey(current), label: current.toLocaleDateString(undefined, { weekday: 'narrow' }), date: current.getDate() }
  })
}
