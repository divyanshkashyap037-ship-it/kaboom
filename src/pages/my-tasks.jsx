import { useMemo, useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { PriorityChip, DueChip, IconButton, SearchInput, SelectInput, EmptyState, Button, Chip } from '../components/ui/primitives.jsx'
import { TaskModal } from '../components/board/task-modal.jsx'
import { Icon } from '../components/ui/icons.jsx'
import {
  PRIORITIES,
  STATUSES,
  addTask,
  deleteTask,
  duplicateTask,
  updateTask,
  useBoard,
  isOverdue,
} from '../store/board-store.js'
import './pages.css'

const SORTS = [
  { id: 'desc', label: 'Newest' },
  { id: 'asc', label: 'Oldest' },
  { id: 'due', label: 'Due date' },
  { id: 'priority', label: 'Priority' },
]

export function MyTasksPage({ onMenu, railOpen }) {
  const { tasks, projects } = useBoard()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [sort, setSort] = useState('due')
  const [modal, setModal] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      return true
    })

    const prioRank = { high: 0, medium: 1, low: 2 }
    return filtered.sort((a, b) => {
      if (sort === 'due') return (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99')
      if (sort === 'priority') return prioRank[a.priority] - prioRank[b.priority]
      if (sort === 'asc') return a.createdAt - b.createdAt
      return b.createdAt - a.createdAt
    })
  }, [tasks, query, statusFilter, priorityFilter, sort])

  return (
    <AppShell railOpen={railOpen} onMenu={onMenu} title="My Tasks" subtitle="Everything assigned to you, sorted the way you like.">
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search tasks by title…" />
        <SelectInput label="Filter by status" value={statusFilter} onChange={setStatusFilter} options={STATUSES} allLabel="All statuses" />
        <SelectInput label="Filter by priority" value={priorityFilter} onChange={setPriorityFilter} options={PRIORITIES} allLabel="All priorities" />
        <SelectInput label="Sort tasks" value={sort} onChange={setSort} options={SORTS} />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon="tasks"
          title={query || statusFilter !== 'all' || priorityFilter !== 'all' ? 'No tasks match' : 'No tasks yet'}
          hint={
            query || statusFilter !== 'all' || priorityFilter !== 'all'
              ? 'Try clearing the search or filters.'
              : 'Create your first task to get going.'
          }
          action={<Button icon="plus" onClick={() => setModal({})}>New task</Button>}
        />
      ) : (
        <section className="task-list" aria-label="Task list">
          {rows.map((t) => {
            const project = projects.find((p) => p.id === t.projectId)
            const overdue = isOverdue(t)
            return (
              <article key={t.id} className={`task-row${t.status === 'completed' ? ' done' : ''}`}>
                <span className="priority-dot" style={{ background: PRIORITIES.find((p) => p.id === t.priority)?.color }} />

                <div className="task-row-main">
                  <h3>{t.title}</h3>
                  {t.description ? <p>{t.description}</p> : null}
                  <div className="task-row-chips">
                    <Chip color={t.status === 'completed' ? 'var(--success)' : t.status === 'inprogress' ? 'var(--warning)' : 'var(--accent)'}>
                      <Icon name={STATUSES.find((s) => s.id === t.status)?.icon || 'inbox'} size={11} strokeWidth={2.4} />
                      {STATUSES.find((s) => s.id === t.status)?.label}
                    </Chip>
                    <PriorityChip priority={t.priority} />
                    <DueChip due={t.due} status={t.status} />
                    {project ? (
                      <Chip color={project.color}>
                        <span className="project-dot" style={{ background: project.color }} />
                        {project.name}
                      </Chip>
                    ) : null}
                    {overdue ? <Chip color="var(--danger)"><Icon name="alert" size={12} /> overdue</Chip> : null}
                  </div>
                </div>

                <div className="task-row-actions">
                  <IconButton icon="copy" label="Duplicate" onClick={() => duplicateTask(t.id)} />
                  <IconButton icon="pencil" label="Edit" onClick={() => setModal({ initial: t })} />
                  <IconButton icon="trash" label="Delete" tone="danger" onClick={() => deleteTask(t.id)} />
                </div>
              </article>
            )
          })}
        </section>
      )}

      <TaskModal
        key={modal ? (modal.initial ? `edit-${modal.initial.id}` : 'new') : 'none'}
        open={!!modal}
        initial={modal?.initial || null}
        projects={projects.filter((p) => !p.archived)}
        onClose={() => setModal(null)}
        onSave={(fields) => {
          const payload = { ...fields, projectId: fields.projectId || null }
          if (modal?.initial) updateTask(modal.initial.id, payload)
          else addTask(payload)
          setModal(null)
        }}
      />
    </AppShell>
  )
}
