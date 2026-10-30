import { useEffect, useMemo, useState } from 'react'
import { NavRail } from './components/nav/nav-rail.jsx'
import { KanbanPage } from './pages/kanban.jsx'
import { DashboardPage } from './pages/dashboard.jsx'
import { MyTasksPage } from './pages/my-tasks.jsx'
import { ProjectsPage } from './pages/projects.jsx'
import { JournalPage } from './pages/journal.jsx'
import { WhiteboardPage } from './pages/whiteboard.jsx'
import { AnalyticsPage } from './pages/analytics.jsx'
import { NotificationsPage } from './pages/notifications.jsx'
import { SettingsPage } from './pages/settings.jsx'
import { NotificationToasts } from './components/ui/notification-toasts.jsx'
import { deriveDueNotifications, useBoard } from './store/board-store.js'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'kanban', label: 'Kanban Board', icon: 'kanban' },
  { id: 'tasks', label: 'My Tasks', icon: 'tasks' },
  { id: 'projects', label: 'Projects', icon: 'projects' },
  { id: 'journal', label: 'Journal', icon: 'journal' },
  { id: 'whiteboard', label: 'Whiteboard', icon: 'whiteboard' },
  { id: 'analytics', label: 'Analytics', icon: 'analytics' },
  { id: 'notifications', label: 'Notifications', icon: 'bell' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
]

const PAGES = {
  dashboard: DashboardPage,
  kanban: KanbanPage,
  tasks: MyTasksPage,
  projects: ProjectsPage,
  journal: JournalPage,
  whiteboard: WhiteboardPage,
  analytics: AnalyticsPage,
  notifications: NotificationsPage,
  settings: SettingsPage,
}

export default function App() {
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem('kaboom:page')
    return saved && NAV_ITEMS.some((i) => i.id === saved) ? saved : 'dashboard'
  })
  const [navOpen, setNavOpen] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const { tasks, settings, notifications } = useBoard()

  // Persist last visited page
  useEffect(() => {
    localStorage.setItem('kaboom:page', page)
  }, [page])

  // Allow deep links from inside pages (e.g. Dashboard "Open board")
  useEffect(() => {
    const navigate = (e) => {
      if (e.detail && NAV_ITEMS.some((i) => i.id === e.detail)) setPage(e.detail)
    }
    window.addEventListener('app:navigate', navigate)
    return () => window.removeEventListener('app:navigate', navigate)
  }, [])

  // Theme class on <body>
  useEffect(() => {
    document.body.classList.toggle('dark', settings.theme === 'dark')
  }, [settings.theme])

  // Badge on the notifications nav item: unread events + live due-date reminders
  const badge = useMemo(() => {
    const unread = notifications.filter((n) => !n.read).length
    const dueReminders = deriveDueNotifications(tasks).filter((d) => d.kind === 'overdue' || d.kind === 'due-today').length
    return unread + dueReminders
  }, [notifications, tasks])

  const PageView = PAGES[page] || DashboardPage

  return (
    <main className="shader-page">
      <NavRail
        items={NAV_ITEMS.map((item) => (item.id === 'notifications' && badge ? { ...item, badge } : item))}
        active={page}
        onNavigate={setPage}
        open={navOpen}
        onToggle={() => setNavOpen((v) => !v)}
        mobileOpen={mobileNav}
        onMobileClose={() => setMobileNav(false)}
      />
      <PageView onMenu={() => setMobileNav(true)} railOpen={navOpen} />
      <NotificationToasts onOpenNotifications={() => setPage('notifications')} />
    </main>
  )
}
