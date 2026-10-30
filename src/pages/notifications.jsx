import { Button, Chip, EmptyState, IconButton } from '../components/ui/primitives.jsx'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Icon } from '../components/ui/icons.jsx'
import {
  clearNotifications,
  deriveDueNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  useBoard,
} from '../store/board-store.js'
import './pages.css'

const KIND_ICON = {
  created: ['plus', 'var(--accent)'],
  updated: ['pencil', 'var(--accent)'],
  moved: ['grip', 'var(--warning)'],
  deleted: ['trash', 'var(--danger)'],
}

export function NotificationsPage({ onMenu, railOpen }) {
  const { notifications, tasks } = useBoard()
  const due = deriveDueNotifications(tasks)
  const unread = notifications.filter((n) => !n.read).length

  return (
    <AppShell
      railOpen={railOpen}
      onMenu={onMenu}
      title="Notifications"
      subtitle="Due-date reminders and everything that changed."
      actions={
        unread > 0 ? <Button icon="check" onClick={markAllNotificationsRead}>Mark all read</Button> : null
      }
    >
      <div className="dash-grid">
        {due.length > 0 ? (
          <section className="panel wide">
            <header className="panel-head"><h2><Icon name="calendar" size={16} /> Due-date reminders</h2></header>
            <div className="notif-rows">
              {due.map(({ id, kind, task, days }) => (
                <div key={id} className={`notif-row${kind === 'overdue' ? ' urgent' : ''}`}>
                  <span className="notif-icon urgent">
                    <Icon name={kind === 'overdue' ? 'alert' : 'clock'} size={15} />
                  </span>
                  <div className="notif-meta">
                    <span className="notif-title">{task.title}</span>
                    <span className="notif-sub">
                      {kind === 'overdue' ? `Overdue by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}` : kind === 'due-today' ? 'Due today' : `Due in ${days} days`}
                    </span>
                  </div>
                  <Chip color={kind === 'overdue' ? 'var(--danger)' : kind === 'due-today' ? 'var(--warning)' : 'var(--accent)'}>
                    {task.status === 'inprogress' ? 'In Progress' : task.status === 'todo' ? 'Todo' : 'Completed'}
                  </Chip>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="panel wide">
          <header className="panel-head">
            <h2><Icon name="bell" size={16} /> Activity feed</h2>
            {notifications.length > 0 ? (
              <div className="panel-head-actions">
                <IconButton icon="trash" label="Clear all notifications" tone="danger" onClick={clearNotifications} />
              </div>
            ) : null}
          </header>

          {notifications.length === 0 ? (
            <EmptyState
              icon="bell"
              title="No events yet"
              hint="Create, move or edit tasks and the feed will light up here."
            />
          ) : (
            <div className="notif-rows">
              {notifications.slice(0, 12).map((n) => {
                const [icon, tone] = KIND_ICON[n.type] || ['bell', 'var(--accent)']
                return (
                  <div key={n.id} className={`notif-row${n.read ? '' : ' unread'}`}>
                    <span className="notif-icon" style={{ color: tone }}>
                      <Icon name={icon} size={15} />
                    </span>
                    <div className="notif-meta">
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-sub">{n.body}</span>
                    </div>
                    <span className="notif-time">
                      {new Date(n.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!n.read ? (
                      <IconButton icon="check" label="Mark as read" onClick={() => markNotificationRead(n.id)} />
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  )
}
