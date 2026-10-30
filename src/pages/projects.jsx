import { useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Button, EmptyState, IconButton, ProgressBar } from '../components/ui/primitives.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { addProject, updateProject, useBoard } from '../store/board-store.js'
import './pages.css'

const COLORS = ['#2f7fdd', '#2f9a6b', '#e59a2f', '#e2574c', '#8a63d2', '#13a3a3']

export function ProjectsPage({ onMenu, railOpen }) {
  const { projects, tasks } = useBoard()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [error, setError] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  const create = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Project name is required')
      return
    }
    if (name.trim().length < 3) {
      setError('Name needs at least 3 characters')
      return
    }
    addProject(name.trim(), color)
    setName('')
    setError('')
  }

  const rows = projects.filter((p) => (showArchived ? true : !p.archived))

  return (
    <AppShell railOpen={railOpen} onMenu={onMenu} title="Projects" subtitle="Group tasks, switch focus and archive what is done.">
      <form className="toolbar project-create" onSubmit={create}>
        <div className="project-name-input">
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="New project name…"
            aria-label="New project name"
            className={error ? 'invalid' : ''}
            maxLength={40}
          />
          {error ? <span className="field-error"><Icon name="alert" size={13} /> {error}</span> : null}
        </div>
        <div className="palette-row" role="radiogroup" aria-label="Project color">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={color === c}
              className={`swatch${color === c ? ' selected' : ''}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Use color ${c}`}
            />
          ))}
        </div>
        <Button type="submit" icon="plus">Create project</Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState icon="projects" title="No projects yet" hint="Create a project to organize your tasks." />
      ) : (
        <div className="project-grid">
          {rows.map((p) => {
            const pts = tasks.filter((t) => t.projectId === p.id)
            const done = pts.filter((t) => t.status === 'completed').length
            const overdue = pts.filter((t) => t.status !== 'completed' && t.due && new Date(`${t.due}T00:00:00`) < new Date()).length
            return (
              <section key={p.id} className={`project-card${p.archived ? ' archived' : ''}`}>
                <header>
                  <span className="project-dot big" style={{ background: p.color }} />
                  <h3>{p.name}</h3>
                  <div className="project-card-actions">
                    <IconButton
                      icon={p.archived ? 'archive' : 'archive'}
                      label={p.archived ? 'Restore project' : 'Archive project'}
                      onClick={() => updateProject(p.id, { archived: !p.archived })}
                    />
                  </div>
                </header>
                <ProgressBar value={pts.length ? done / pts.length : 0} tone={p.color} />
                <footer>
                  <span><Icon name="tasks" size={13} /> {pts.length} tasks</span>
                  <span><Icon name="check" size={13} /> {done} done</span>
                  {overdue ? <span className="overdue-text"><Icon name="alert" size={13} /> {overdue} overdue</span> : null}
                  {p.archived ? <span className="archived-flag">archived</span> : null}
                </footer>
              </section>
            )
          })}
        </div>
      )}

      <div className="toolbar">
        <Button variant="ghost" icon="archive" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? 'Hide archived' : `Show archived (${projects.filter((p) => p.archived).length})`}
        </Button>
      </div>
    </AppShell>
  )
}
