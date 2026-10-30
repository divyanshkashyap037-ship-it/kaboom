import { useMemo } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { ProgressBar, StatCard } from '../components/ui/primitives.jsx'
import { STATUSES, isOverdue, useBoard } from '../store/board-store.js'
import './pages.css'

export function AnalyticsPage({ onMenu, railOpen }) {
  const { tasks, projects } = useBoard()

  const stats = useMemo(() => {
    const total = tasks.length
    const byStatus = Object.fromEntries(STATUSES.map((s) => [s.id, tasks.filter((t) => t.status === s.id).length]))
    const completed = byStatus.completed
    const overdue = tasks.filter(isOverdue).length
    const onTime = completed
    const completionRate = total ? completed / total : 0

    const perProject = projects
      .filter((p) => !p.archived)
      .map((p) => {
        const pts = tasks.filter((t) => t.projectId === p.id)
        return { ...p, total: pts.length, done: pts.filter((t) => t.status === 'completed').length }
      })
      .sort((a, b) => b.total - a.total)

    const perPriority = ['high', 'medium', 'low'].map((id) => ({
      id,
      total: tasks.filter((t) => t.priority === id).length,
      done: tasks.filter((t) => t.priority === id && t.status === 'completed').length,
    }))

    // Last 7 days completions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const week = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(today)
      day.setDate(day.getDate() - (6 - i))
      const key = day.toISOString().slice(0, 10)
      const count = tasks.filter((t) => t.status === 'completed' && t.updatedAt >= day.getTime() && t.updatedAt < day.getTime() + 86400000).length
      return { key, label: day.toLocaleDateString(undefined, { weekday: 'short' })[0], count }
    })

    return { total, completed, overdue, onTime, completionRate, perProject, perPriority, byStatus, week }
  }, [tasks, projects])

  const maxWeek = Math.max(1, ...stats.week.map((w) => w.count))

  return (
    <AppShell railOpen={railOpen} onMenu={onMenu} title="Analytics" subtitle="How your work is flowing — completion, overdue and progress.">
      <div className="stat-grid">
        <StatCard icon="analytics" label="Completion rate" value={`${Math.round(stats.completionRate * 100)}%`} />
        <StatCard icon="check" label="Tasks completed" value={stats.completed} tone="success" />
        <StatCard icon="alert" label="Overdue" value={stats.overdue} tone="danger" />
        <StatCard icon="activity" label="In progress" value={stats.byStatus.inprogress} tone="warning" />
      </div>

      <div className="dash-grid">
        <section className="panel">
          <header className="panel-head"><h2><Icon name="analytics" size={16} /> Weekly completions</h2><span className="panel-hint">last 7 days</span></header>
          <div className="week-chart" role="img" aria-label="Tasks completed per day over the last week">
            {stats.week.map((d) => (
              <div key={d.key} className="week-bar" title={`${d.count} completed`}>
                <div
                  className="week-bar-fill"
                  style={{ height: `${(d.count / maxWeek) * 100}%`, opacity: d.count ? 1 : 0.25 }}
                />
                <span>{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><h2><Icon name="projects" size={16} /> Project progress</h2></header>
          {stats.perProject.length === 0 ? <p className="panel-empty">No active projects.</p> : null}
          <div className="project-rows">
            {stats.perProject.map((p) => (
              <div key={p.id} className="project-row">
                <span className="project-dot big" style={{ background: p.color }} />
                <div className="project-row-meta">
                  <span className="project-row-name">{p.name}</span>
                  <ProgressBar value={p.total ? p.done / p.total : 0} tone={p.color} />
                </div>
                <span className="project-row-count">{p.done}/{p.total}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel wide">
          <header className="panel-head"><h2><Icon name="flag" size={16} /> Priority mix</h2></header>
          <div className="priority-mix">
            {stats.perPriority.map((p) => (
              <div key={p.id} className="priority-column">
                <div
                  className="priority-column-fill"
                  style={{
                    height: `${Math.round(p.total ? (p.done / p.total) * 100 : 0)}%`,
                    background: `var(--prio-${p.id})`,
                  }}
                />
                <span className="priority-column-label">{p.id === 'high' ? 'High' : p.id === 'medium' ? 'Med' : 'Low'}</span>
                <span className="priority-column-count">{p.done}/{p.total}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  )
}
