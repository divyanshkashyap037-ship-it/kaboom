import { useMemo, useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { KanbanBoard } from '../components/board/kanban-board.jsx'
import { TaskModal } from '../components/board/task-modal.jsx'
import { Button, SearchInput, SelectInput } from '../components/ui/primitives.jsx'
import { PRIORITIES, STATUSES, addTask, deleteTask, duplicateTask, moveTask, updateTask, useBoard } from '../store/board-store.js'
import './pages.css'

export function KanbanPage({ onMenu, railOpen }) {
  const { tasks, projects } = useBoard()
  const [query, setQuery] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [modal, setModal] = useState(null) // { initial?, status? } | null

  const activeProjects = projects.filter((p) => !p.archived)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q)) return false
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false
      if (projectFilter !== 'all') {
        if (projectFilter === 'none' ? t.projectId !== null : t.projectId !== projectFilter) return false
      }
      return true
    })
  }, [tasks, query, priorityFilter, projectFilter])

  const filtersActive = query !== '' || priorityFilter !== 'all' || projectFilter !== 'all'

  return (
    <AppShell
      railOpen={railOpen}
      onMenu={onMenu}
      title="Kanban Board"
      subtitle="Drag cards between columns, or use the inline arrows on touch."
      actions={<Button icon="plus" onClick={() => setModal({ status: 'todo' })}>New task</Button>}
    >
      <div className="toolbar">
        <SearchInput value={query} onChange={setQuery} placeholder="Search tasks by title…" />
        <SelectInput
          label="Filter by priority"
          value={priorityFilter}
          onChange={setPriorityFilter}
          options={PRIORITIES}
          allLabel="All priorities"
        />
        <SelectInput
          label="Filter by project"
          value={projectFilter}
          onChange={setProjectFilter}
          options={[{ id: 'none', label: 'No project' }, ...activeProjects]}
          allLabel="All projects"
        />
        {filtersActive ? (
          <Button
            variant="ghost"
            icon="x"
            onClick={() => {
              setQuery('')
              setPriorityFilter('all')
              setProjectFilter('all')
            }}
          >
            Clear filters
          </Button>
        ) : null}
      </div>

      {filtersActive && filtered.length === 0 ? (
        <div className="board">
          {STATUSES.map((col) => (
            <section key={col.id} className="board-col" aria-label={col.label}>
              <header className="col-head">
                <div className="col-title"><h2>{col.label}</h2></div>
              </header>
              <div className="col-cards">
                <div className="col-empty" style={{ minHeight: 160 }}>
                  <p>No matching tasks</p>
                  <span style={{ fontSize: 11.5 }}>Try different search or filters</span>
                </div>
              </div>
            </section>
          ))}
        </div>
      ) : (
        <KanbanBoard
          tasks={filtered}
          projects={projects}
          onMove={moveTask}
          onDuplicate={duplicateTask}
          onDelete={(task) => deleteTask(task.id)}
          onEdit={(task) => setModal({ initial: task })}
          onAdd={(status) => setModal({ status })}
        />
      )}

      <TaskModal
        key={modal ? (modal.initial ? `edit-${modal.initial.id}` : 'new') : 'none'}
        open={!!modal}
        initial={modal?.initial || null}
        defaultStatus={modal?.status}
        projects={activeProjects}
        onClose={() => setModal(null)}
        onSave={(fields) => {
          const payload = { ...fields, projectId: fields.projectId || null, status: modal?.initial ? fields.status : (modal?.status || fields.status) }
          if (modal?.initial) updateTask(modal.initial.id, payload)
          else addTask(payload)
          setModal(null)
        }}
      />
    </AppShell>
  )
}
