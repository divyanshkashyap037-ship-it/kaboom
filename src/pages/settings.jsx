import { useRef, useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Button } from '../components/ui/primitives.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { exportData, importData, resetAll, updateSettings, useBoard } from '../store/board-store.js'
import './pages.css'

export function SettingsPage({ onMenu, railOpen }) {
  const { settings, tasks, projects } = useBoard()
  const fileRef = useRef(null)
  const [notice, setNotice] = useState(null)

  const toggleTheme = () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })

  const download = () => {
    const blob = new Blob([exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kaboom-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setNotice({ tone: 'ok', text: 'Backup downloaded.' })
  }

  const onImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      importData(await file.text())
      setNotice({ tone: 'ok', text: 'Workspace restored from backup.' })
    } catch {
      setNotice({ tone: 'bad', text: 'That file is not a valid KaBoom backup.' })
    }
    e.target.value = ''
  }

  return (
    <AppShell railOpen={railOpen} onMenu={onMenu} title="Settings" subtitle="Profile, appearance and your data." actions={
      notice ? <span className={`setting-notice ${notice.tone}`}>{notice.text}</span> : null
    }>
      <div className="dash-grid">
        <section className="panel wide">
          <header className="panel-head"><h2><Icon name="user" size={16} /> Profile</h2></header>
          <div className="profile-row">
            <span className="profile-avatar"><Icon name="user" size={26} /></span>
            <div>
              <h3>Workspace Owner</h3>
              <p>Local profile — stored on this device, in LocalStorage.</p>
            </div>
          </div>
        </section>

        <section className="panel">
          <header className="panel-head"><h2><Icon name="palette" size={16} /> Appearance</h2></header>
          <button type="button" className="setting-row" onClick={toggleTheme} aria-pressed={settings.theme === 'dark'}>
            <span className="setting-icon">
              <Icon name={settings.theme === 'dark' ? 'moon' : 'sun'} size={17} />
            </span>
            <span className="setting-meta">
              <span className="setting-title">{settings.theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
              <span className="setting-sub">Tap to switch the sky.</span>
            </span>
            <span className={`setting-switch ${settings.theme === 'dark' ? 'on' : ''}`} aria-hidden="true">
              <span className="setting-knob" />
            </span>
          </button>

        </section>

        <section className="panel">
          <header className="panel-head"><h2><Icon name="database" size={16} /> Data management</h2></header>
          <p className="panel-hint" style={{ margin: '0 0 12px' }}>
            {tasks.length} tasks · {projects.length} projects · kept in LocalStorage on this browser.
          </p>
          <div className="setting-actions">
            <Button variant="ghost" icon="copy" onClick={download}>Export JSON</Button>
            <Button variant="ghost" icon="database" onClick={() => fileRef.current?.click()}>Import backup</Button>
            <Button variant="ghost" icon="trash" className="danger" onClick={() => {
              if (window.confirm('Delete ALL tasks and reset the workspace?')) {
                resetAll()
                setNotice({ tone: 'ok', text: 'Workspace reset to sample data.' })
              }
            }}>
              Reset workspace
            </Button>
            <input ref={fileRef} type="file" accept="application/json" onChange={onImport} hidden aria-label="Import backup file" />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
