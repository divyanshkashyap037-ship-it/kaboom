import { useState } from 'react'
import { Icon } from '../ui/icons.jsx'
import { STATUSES, PRIORITIES, isOverdue, formatDue } from '../../store/board-store.js'
import { DueChip, IconButton, PriorityChip } from '../ui/primitives.jsx'
import './kanban-board.css'

export function KanbanBoard({ tasks, projects, onEdit, onDelete, onDuplicate, onAdd, onMove }) {
  const [dragId, setDragId] = useState(null)
  const [dropTarget, setDropTarget] = useState(null) // `${status}|${beforeId | 'end'}`

  const handleDrop = (status, beforeId) => {
    if (dragId) onMove(dragId, status, beforeId)
    setDragId(null)
    setDropTarget(null)
  }

  return (
    <div className="board">
      {STATUSES.map((col) => {
        const items = tasks.filter((t) => t.status === col.id)
        return (
          <section
            key={col.id}
            className={`board-col${dropTarget?.startsWith(`${col.id}|`) ? ' over' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              if (!dropTarget) setDropTarget(`${col.id}|end`)
            }}
            onDrop={(e) => {
              e.preventDefault()
              handleDrop(col.id, dropTarget?.split('|')[1] === 'end' ? null : dropTarget?.split('|')[1])
            }}
            aria-label={`${col.label} column`}
          >
            <header className="col-head">
              <div className="col-title">
                <Icon name={col.icon} size={16} strokeWidth={2.1} />
                <h2>{col.label}</h2>
                <span className="col-count">{items.length}</span>
              </div>
              <IconButton icon="plus" label={`Add task to ${col.label}`} size={17} onClick={() => onAdd(col.id)} />
            </header>

            <div className="col-cards">
              {items.length === 0 ? (
                <div className="col-empty">
                  <Icon name="cloud" size={22} strokeWidth={1.5} />
                  <p>Nothing here</p>
                  <button type="button" onClick={() => onAdd(col.id)}>Add a task</button>
                </div>
              ) : null}

              {items.map((task) => (
                <DraggableCard
                  key={task.id}
                  task={task}
                  project={projects.find((p) => p.id === task.projectId)}
                  dragging={dragId === task.id}
                  dropBefore={dropTarget === `${col.id}|${task.id}`}
                  onDragStart={() => setDragId(task.id)}
                  onDragEnd={() => {
                    setDragId(null)
                    setDropTarget(null)
                  }}
                  onDragEnterCard={() => setDropTarget(`${col.id}|${task.id}`)}
                  onEdit={() => onEdit(task)}
                  onDelete={() => onDelete(task)}
                  onDuplicate={() => onDuplicate(task)}
                  onMove={(status) => onMove(task.id, status)}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

/* Mobile-friendly fallback: a compact status switcher rendered in the open board when dragging is impractical. */
function DraggableCard({
  task,
  project,
  dragging,
  dropBefore,
  onDragStart,
  onDragEnd,
  onDragEnterCard,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}) {
  const prioMeta = PRIORITIES.find((p) => p.id === task.priority)
  const overdue = isOverdue(task)
  const currentIdx = STATUSES.findIndex((s) => s.id === task.status)

  return (
    <article
      className={`task-card${dragging ? ' dragging' : ''}${dropBefore ? ' drop-before' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move'
        try { e.dataTransfer.setData('text/plain', task.id) } catch { /* IE quirks */ }
        onDragStart()
      }}
      onDragEnd={onDragEnd}
      onDragEnter={onDragEnterCard}
    >
      <div className="card-top">
        <span className="priority-dot" style={{ background: prioMeta?.color || 'var(--ink-3)' }} title={`${prioMeta?.label} priority`} />
        <span className="card-grip"><Icon name="grip" size={14} /></span>
        <div className="card-actions">
          {STATUSES.map((s, i) => (
            i !== currentIdx ? (
              <button key={s.id} type="button" className="move-chip" onClick={() => onMove(s.id)} title={`Move to ${s.label}`}>
                <Icon name={s.icon} size={13} strokeWidth={2.2} />
              </button>
            ) : null
          ))}
          <IconButton icon="copy" label="Duplicate task" size={14} onClick={onDuplicate} />
          <IconButton icon="pencil" label="Edit task" size={14} onClick={onEdit} />
          <IconButton icon="trash" label="Delete task" size={14} tone="danger" onClick={onDelete} />
        </div>
      </div>

      <h3 className="card-title">{task.title}</h3>
      {task.description ? <p className="card-desc">{task.description}</p> : null}

      <footer className="card-foot">
        {project ? (
          <span className="card-project" title={project.name}>
            <span className="project-dot" style={{ background: project.color }} />
            {project.name}
          </span>
        ) : <span className="card-project" />}
        <div className="card-chips">
          <PriorityChip priority={task.priority} />
          <DueChip due={task.due} status={task.status} />
        </div>
      </footer>

      {overdue ? <span className="overdue-flag"><Icon name="alert" size={12} /> overdue</span> : <span className="visually-hidden">{formatDue(task.due)}</span>}
    </article>
  )
}
