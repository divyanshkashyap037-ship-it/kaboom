import { Icon } from '../ui/icons.jsx'
import './app-shell.css'

/**
 * Right-hand glass page panel that sits beside the nav rail.
 * The rail expands over the sky background while this panel
 * shifts right responsively (pure CSS on .app-shell padding).
 */
export function AppShell({ title, subtitle, actions, railOpen, onMenu, children }) {
  return (
    <div className={`app-shell${railOpen ? ' rail-open' : ''}`}>
      <main className="page-panel glass-scroll" id="page-panel">
        <button type="button" className="mobile-menu-btn" onClick={onMenu} aria-label="Open navigation">
          <Icon name="menu" size={20} />
        </button>

        <header className="page-head">
          <div className="page-head-text">
            <h1>{title}</h1>
            {subtitle ? <p>{subtitle}</p> : null}
          </div>
          {actions ? <div className="page-head-actions">{actions}</div> : null}
        </header>

        <div className="page-body">{children}</div>
      </main>
    </div>
  )
}
