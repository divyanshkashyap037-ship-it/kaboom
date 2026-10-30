import { useEffect, useRef, useState } from 'react'
import { Icon } from '../ui/icons.jsx'
import { STATUSES, PRIORITIES } from '../../store/board-store.js'
import { Button } from '../ui/primitives.jsx'
import './task-modal.css'

export function TaskModal({ open, initial, defaultStatus, projects, onClose, onSave }) {
  // Note: this component is remounted by the parent (via `key`) whenever a
  // different task opens, so the state initializer always sees fresh data.
  const [fields, setFields] = useState(() =>
    initial
      ? {
          title: initial.title,
          description: initial.description || '',
          priority: initial.priority,
          due: initial.due || '',
          status: initial.status,
          projectId: initial.projectId || '',
        }
      : { title: '', description: '', priority: 'medium', due: '', status: defaultStatus || 'todo', projectId: '' },
  )
  const [errors, setErrors] = useState({})
  const titleRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const set = (key) => (e) => setFields((f) => ({ ...f, [key]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!fields.title.trim()) next.title = 'Title is required'
    else if (fields.title.trim().length < 3) next.title = 'Title needs at least 3 characters'
    if (fields.due && new Date(`${fields.due}T00:00:00`).toString() === 'Invalid Date') next.due = 'Invalid date'
    setErrors(next)
    if (Object.keys(next).length) return
    onSave({ ...fields, title: fields.title.trim() })
  }

  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-label={initial ? 'Edit task' : 'New task'}>
      <div className="modal-backdrop" onClick={onClose} aria-hidden="true" />
      <form className="task-modal glass-scroll" onSubmit={submit} noValidate>
        <header className="modal-head">
          <h2>
            <Icon name={initial ? 'pencil' : 'plus'} size={18} strokeWidth={2.2} />
            {initial ? 'Edit task' : 'New task'}
          </h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <Icon name="x" size={18} strokeWidth={2.2} />
          </button>
        </header>

        <div className="modal-body">
          <div className="field">
            <label htmlFor="task-title">Title</label>
            <input
              id="task-title"
              ref={titleRef}
              autoFocus
              value={fields.title}
              onChange={set('title')}
              placeholder="What needs to be done?"
              className={errors.title ? 'invalid' : ''}
              aria-invalid={!!errors.title}
              maxLength={80}
            />
            {errors.title ? <span className="field-error"><Icon name="alert" size={13} /> {errors.title}</span> : null}
          </div>

          <div className="field">
            <label htmlFor="task-desc">Description</label>
            <textarea
              id="task-desc"
              rows={3}
              value={fields.description}
              onChange={set('description')}
              placeholder="Optional details…"
              maxLength={280}
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label htmlFor="task-priority">Priority</label>
              <select id="task-priority" value={fields.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-status">Status</label>
              <select id="task-status" value={fields.status} onChange={set('status')}>
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="task-due">Due date</label>
              <input id="task-due" type="date" value={fields.due} onChange={set('due')} />
            </div>

            <div className="field">
              <label htmlFor="task-project">Project</label>
              <select id="task-project" value={fields.projectId} onChange={set('projectId')}>
                <option value="">No project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <footer className="modal-foot">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" icon={initial ? 'check' : 'plus'}>{initial ? 'Save changes' : 'Create task'}</Button>
        </footer>
      </form>
    </div>
  )
}
