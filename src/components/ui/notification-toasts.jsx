import { useEffect, useRef, useState } from 'react'
import { deriveDueNotifications, markNotificationRead, useBoard } from '../../store/board-store.js'
import { Icon } from './icons.jsx'
import './notification-toasts.css'

const EVENT_META = {
  created: { icon: 'plus', tone: 'accent' },
  updated: { icon: 'pencil', tone: 'accent' },
  moved: { icon: 'grip', tone: 'warning' },
  deleted: { icon: 'trash', tone: 'danger' },
  overdue: { icon: 'alert', tone: 'danger' },
  'due-today': { icon: 'clock', tone: 'warning' },
  'due-soon': { icon: 'clock', tone: 'accent' },
}

function makeDueToast(reminder) {
  const { kind, task, days } = reminder
  const amount = Math.abs(days)
  const body = kind === 'overdue'
    ? `“${task.title}” is overdue by ${amount} day${amount === 1 ? '' : 's'}.`
    : kind === 'due-today'
      ? `“${task.title}” is due today.`
      : `“${task.title}” is due in ${days} days.`

  return {
    id: reminder.id,
    title: kind === 'overdue' ? 'A task needs attention' : 'A gentle reminder',
    body,
    type: kind,
    notificationId: null,
  }
}

function makeEventToast(notification) {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    notificationId: notification.id,
  }
}

export function NotificationToasts({ onOpenNotifications }) {
  const { notifications, tasks } = useBoard()
  const [toasts, setToasts] = useState(() => deriveDueNotifications(tasks).slice(0, 2).map(makeDueToast))
  const knownNotifications = useRef(new Set(notifications.map((notification) => notification.id)))

  const dismiss = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  useEffect(() => {
    const fresh = notifications
      .filter((notification) => !knownNotifications.current.has(notification.id))
      .map(makeEventToast)

    notifications.forEach((notification) => knownNotifications.current.add(notification.id))
    if (!fresh.length) return

    setToasts((current) => [...fresh, ...current].slice(0, 3))
  }, [notifications])

  useEffect(() => {
    if (!toasts.length) return undefined
    const timers = toasts.map((toast) => window.setTimeout(() => dismiss(toast.id), 6500))
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [toasts])

  if (!toasts.length) return null

  return (
    <aside className="toast-region" aria-label="Notifications" aria-live="polite">
      {toasts.map((toast) => {
        const meta = EVENT_META[toast.type] || { icon: 'bell', tone: 'accent' }
        return (
          <article className={`toast toast-${meta.tone}`} key={toast.id}>
            <span className="toast-icon" aria-hidden="true"><Icon name={meta.icon} size={18} /></span>
            <div className="toast-copy">
              <strong>{toast.title}</strong>
              <p>{toast.body}</p>
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  if (toast.notificationId) markNotificationRead(toast.notificationId)
                  dismiss(toast.id)
                  onOpenNotifications()
                }}
              >
                View activity <Icon name="chevronRight" size={14} />
              </button>
            </div>
            <button type="button" className="toast-dismiss" onClick={() => dismiss(toast.id)} aria-label={`Dismiss ${toast.title}`}>
              <Icon name="x" size={15} />
            </button>
          </article>
        )
      })}
    </aside>
  )
}
