import { useSyncExternalStore } from 'react'

/* ------------------------------------------------------------------ */
/* LocalStorage-backed external store                                  */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'kaboom:board:v2'

export const STATUSES = [
  { id: 'todo', label: 'Todo', icon: 'inbox' },
  { id: 'inprogress', label: 'In Progress', icon: 'activity' },
  { id: 'completed', label: 'Completed', icon: 'check' },
]

export const PRIORITIES = [
  { id: 'high', label: 'High', color: 'var(--prio-high)' },
  { id: 'medium', label: 'Medium', color: 'var(--prio-medium)' },
  { id: 'low', label: 'Low', color: 'var(--prio-low)' },
]

const uid = () => (globalThis.crypto?.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`)

function seedData() {
  // First-hand start: a clean workspace with zero pre-made content.
  // The user creates their own projects and tasks from scratch.
  return {
    projects: [],
    tasks: [],
    notifications: [],
    journal: [],
    notes: [],
    settings: { theme: 'light', boardDensity: 'comfortable', focusTaskId: null },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedData()
    const parsed = JSON.parse(raw)
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      settings: { ...seedData().settings, ...(parsed.settings || {}) },
    }
  } catch {
    return seedData()
  }
}

let state = load()
const listeners = new Set()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage full / unavailable — keep going, in-memory still works */
  }
}

function emit() {
  persist()
  listeners.forEach((fn) => fn())
}

function setState(patch) {
  state = typeof patch === 'function' ? patch(state) : { ...state, ...patch }
  emit()
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getBoard() {
  return state
}

export function useBoard() {
  return useSyncExternalStore(subscribe, getBoard, getBoard)
}

/* ------------------------------------------------------------------ */
/* Task operations                                                     */
/* ------------------------------------------------------------------ */

function pushNotification(type, title, body, taskId) {
  setState((s) => ({
    ...s,
    notifications: [
      { id: uid(), type, title, body, taskId: taskId || null, createdAt: Date.now(), read: false },
      ...s.notifications.slice(0, 49),
    ],
  }))
}

export function addTask(fields) {
  const task = {
    id: uid(),
    title: fields.title.trim(),
    description: (fields.description || '').trim(),
    priority: fields.priority,
    due: fields.due || '',
    status: fields.status,
    projectId: fields.projectId || null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  setState((s) => ({ ...s, tasks: [task, ...s.tasks] }))
  pushNotification('created', 'Task created', `"${task.title}" was added to ${statusLabel(task.status)}.`, task.id)
  return task
}

export function updateTask(id, fields) {
  const existing = state.tasks.find((t) => t.id === id)
  setState((s) => ({
    ...s,
    tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...fields, updatedAt: Date.now() } : t)),
  }))
  pushNotification('updated', 'Task updated', `"${(fields.title ?? existing?.title ?? 'Task').trim()}" was edited.`, id)
}

export function deleteTask(id) {
  const task = state.tasks.find((t) => t.id === id)
  setState((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }))
  if (task) pushNotification('deleted', 'Task deleted', `"${task.title}" was removed.`, null)
}

export function duplicateTask(id) {
  const task = state.tasks.find((t) => t.id === id)
  if (!task) return
  const copy = {
    ...task,
    id: uid(),
    title: `${task.title} (copy)`,
    status: task.status === 'completed' ? 'todo' : task.status,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  setState((s) => ({ ...s, tasks: [copy, ...s.tasks] }))
  pushNotification('created', 'Task duplicated', `"${copy.title}" is ready.`, copy.id)
}

/** Move a task to a status, optionally before another task (drag & drop). */
export function moveTask(id, status, beforeId = null) {
  if (!STATUSES.some((s) => s.id === status)) return
  const task = state.tasks.find((t) => t.id === id)
  if (!task) return

  setState((s) => {
    const current = s.tasks.find((t) => t.id === id)
    if (!current) return s
    const rest = s.tasks.filter((t) => t.id !== id)
    const moved = { ...current, status, updatedAt: Date.now() }
    if (beforeId) {
      const idx = rest.findIndex((t) => t.id === beforeId)
      const next = [...rest]
      next.splice(idx >= 0 ? idx : rest.length, 0, moved)
      return { ...s, tasks: next }
    }
    return { ...s, tasks: [...rest, moved] }
  })

  if (task.status !== status) {
    pushNotification('moved', 'Task moved', `"${task.title}" → ${statusLabel(status)}.`, id)
  }
}

export function setTaskOrder(status, orderedIds) {
  setState((s) => {
    const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
    return { ...s, tasks: s.tasks.map((t) => (orderMap.has(t.id) ? { ...t, status, updatedAt: Date.now() } : t)) }
  })
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export function addProject(name, color) {
  const project = { id: uid(), name: name.trim(), color, archived: false }
  setState((s) => ({ ...s, projects: [...s.projects, project] }))
  return project
}

export function updateProject(id, fields) {
  setState((s) => ({ ...s, projects: s.projects.map((p) => (p.id === id ? { ...p, ...fields } : p)) }))
}

/* ------------------------------------------------------------------ */
/* Notifications                                                       */
/* ------------------------------------------------------------------ */

export function markNotificationRead(id) {
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }))
}

export function markAllNotificationsRead() {
  setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) }))
}

export function clearNotifications() {
  setState((s) => ({ ...s, notifications: [] }))
}

/** Derive due-date reminders (overdue, due today, due this week) from tasks. */
export function deriveDueNotifications(tasks) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dayMs = 86400000
  const out = []
  tasks.forEach((t) => {
    if (!t.due || t.status === 'completed') return
    const due = new Date(`${t.due}T00:00:00`)
    const diff = Math.round((due - today) / dayMs)
    if (diff < 0) out.push({ id: `overdue-${t.id}`, kind: 'overdue', task: t, days: diff })
    else if (diff === 0) out.push({ id: `due-today-${t.id}`, kind: 'due-today', task: t, days: diff })
    else if (diff <= 3) out.push({ id: `due-soon-${t.id}`, kind: 'due-soon', task: t, days: diff })
  })
  return out.sort((a, b) => a.days - b.days)
}

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export function addJournal(fields) {
  const entry = {
    id: uid(),
    title: (fields.title || '').trim(),
    body: (fields.body || '').trim(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  setState((s) => ({ ...s, journal: [entry, ...s.journal] }))
  return entry
}

export function updateJournal(id, fields) {
  setState((s) => ({
    ...s,
    journal: s.journal.map((e) => (e.id === id ? { ...e, ...fields, updatedAt: Date.now() } : e)),
  }))
}

export function deleteJournal(id) {
  setState((s) => ({ ...s, journal: s.journal.filter((e) => e.id !== id) }))
}

/* ------------------------------------------------------------------ */
/* Sticky notes                                                        */
/* ------------------------------------------------------------------ */

export function addStickyNote(body, color = 'butter') {
  const text = body.trim()
  if (!text) return null
  const note = {
    id: uid(),
    body: text.slice(0, 360),
    color,
    createdAt: Date.now(),
  }
  setState((s) => ({ ...s, notes: [note, ...s.notes].slice(0, 24) }))
  return note
}

export function updateStickyNote(id, fields) {
  setState((s) => ({
    ...s,
    notes: s.notes.map((note) => (note.id === id ? { ...note, ...fields, body: (fields.body ?? note.body).trim().slice(0, 360) } : note)),
  }))
}

export function deleteStickyNote(id) {
  setState((s) => ({ ...s, notes: s.notes.filter((note) => note.id !== id) }))
}

/* ------------------------------------------------------------------ */
/* Settings & data                                                     */
/* ------------------------------------------------------------------ */

export function updateSettings(fields) {
  setState((s) => ({ ...s, settings: { ...s.settings, ...fields } }))
}

export function exportData() {
  return JSON.stringify(state, null, 2)
}

export function importData(json) {
  const parsed = JSON.parse(json)
  if (!Array.isArray(parsed.tasks)) throw new Error('Invalid backup: missing tasks')
  setState((s) => ({
    ...s,
    tasks: parsed.tasks,
    projects: Array.isArray(parsed.projects) ? parsed.projects : s.projects,
    notifications: Array.isArray(parsed.notifications) ? parsed.notifications : [],
    journal: Array.isArray(parsed.journal) ? parsed.journal : [],
    notes: Array.isArray(parsed.notes) ? parsed.notes : [],
    settings: { ...s.settings, ...(parsed.settings || {}) },
  }))
  pushNotification('updated', 'Data imported', 'Your workspace was restored from backup.', null)
}

export function resetAll() {
  state = seedData()
  emit()
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

export function statusLabel(id) {
  return STATUSES.find((s) => s.id === id)?.label || id
}

export function isOverdue(task) {
  if (!task.due || task.status === 'completed') return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(`${task.due}T00:00:00`) < today
}

export function formatDue(isoDate) {
  if (!isoDate) return null
  const date = new Date(`${isoDate}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((date - today) / 86400000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  if (diff < -1) return `${Math.abs(diff)}d overdue`
  if (diff <= 7) return `in ${diff}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
