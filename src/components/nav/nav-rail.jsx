import { useState } from 'react'
import { Icon } from '../ui/icons.jsx'
import './nav-rail.css'

/**
 * Expanding glass navigation rail.
 * Collapsed = thin glass strip pinned to the left edge like the reference
 * layout. The chevron button at the TOP of the rail expands it; clicking
 * again collapses. Narrow screens use it as an overlay drawer.
 */
export function NavRail({ items, active, onNavigate, open, onToggle, mobileOpen, onMobileClose }) {
  const [hoverHint, setHoverHint] = useState(false)
  const expanded = mobileOpen || open

  return (
    <>
      {mobileOpen ? <div className="rail-backdrop" onClick={onMobileClose} aria-hidden="true" /> : null}

      <nav
        className={`nav-rail${expanded ? ' open' : ''}`}
        onMouseEnter={() => setHoverHint(true)}
        onMouseLeave={() => setHoverHint(false)}
        aria-label="Primary"
      >
        {/* Top control — the expand / collapse toggle */}
        <button
          type="button"
          className={`rail-toggle${hoverHint && !expanded ? ' peek' : ''}${expanded ? ' open' : ''}`}
          onClick={() => (mobileOpen ? onMobileClose() : onToggle())}
          aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
          aria-expanded={expanded}
          title={expanded ? 'Collapse' : 'Expand'}
        >
          <Icon name="chevronsRight" size={15} strokeWidth={2.2} />
        </button>

        <div className="rail-items">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`rail-item${active === item.id ? ' active' : ''}`}
              onClick={() => {
                onNavigate(item.id)
                onMobileClose()
              }}
              aria-current={active === item.id ? 'page' : undefined}
              title={expanded ? undefined : item.label}
            >
              <span className="rail-icon">
                <Icon name={item.icon} size={item.iconSize || 20} />
              </span>
              <span className="rail-label">{item.label}</span>
              {item.badge ? <span className="rail-badge">{item.badge}</span> : null}
            </button>
          ))}
        </div>
      </nav>
    </>
  )
}
