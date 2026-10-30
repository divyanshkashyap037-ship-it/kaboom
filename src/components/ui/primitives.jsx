import { Icon } from './icons.jsx'
import { formatDue, PRIORITIES, isOverdue } from '../../store/board-store.js'
import './primitives.css'

export function Chip({ color, children, soft = true }) {
  return (
    <span className={`chip${soft ? ' soft' : ''}`} style={{ '--chip-color': color }}>
      {children}
    </span>
  )
}

export function PriorityChip({ priority }) {
  const meta = PRIORITIES.find((p) => p.id === priority)
  if (!meta) return null
  return (
    <Chip color={meta.color}>
      <Icon name="flag" size={12} strokeWidth={2.2} />
      {meta.label}
    </Chip>
  )
}

export function DueChip({ due, status }) {
  if (!due) return null
  const overdue = isOverdue({ due, status })
  return (
    <Chip color={overdue ? 'var(--danger)' : 'var(--ink-3)'}>
      <Icon name={overdue ? 'alert' : 'clock'} size={12} strokeWidth={2.1} />
      {formatDue(due)}
    </Chip>
  )
}

export function IconButton({ icon, label, onClick, tone = 'neutral', size = 16 }) {
  return (
    <button type="button" className={`icon-btn ${tone}`} onClick={onClick} aria-label={label} title={label}>
      <Icon name={icon} size={size} />
    </button>
  )
}

export function Button({ children, icon, onClick, variant = 'primary', type = 'button', disabled, className = '' }) {
  return (
    <button type={type} className={`btn ${variant} ${className}`.trim()} onClick={onClick} disabled={disabled}>
      {icon ? <Icon name={icon} size={16} strokeWidth={2} /> : null}
      {children}
    </button>
  )
}

export function EmptyState({ icon = 'inbox', title, hint, action }) {
  return (
    <div className="empty-state">
      <div className="empty-art">
        <Icon name={icon} size={30} strokeWidth={1.4} />
      </div>
      <p className="empty-title">{title}</p>
      {hint ? <p className="empty-hint">{hint}</p> : null}
      {action}
    </div>
  )
}

export function StatCard({ icon, label, value, delta, tone = 'accent' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon">
        <Icon name={icon} size={20} />
      </div>
      <div className="stat-meta">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
      {delta !== undefined ? <span className="stat-delta">{delta}</span> : null}
    </div>
  )
}

export function ProgressBar({ value, tone = 'var(--accent)' }) {
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
      <div className="progress-fill" style={{ width: `${Math.min(100, Math.max(0, value * 100))}%`, background: tone }} />
    </div>
  )
}

export function SearchInput({ value, onChange, placeholder = 'Search…' }) {
  return (
    <label className="search-input">
      <Icon name="search" size={16} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      {value ? (
        <button type="button" className="search-clear" onClick={() => onChange('')} aria-label="Clear search">
          <Icon name="x" size={13} strokeWidth={2.2} />
        </button>
      ) : null}
    </label>
  )
}

export function SelectInput({ value, onChange, options, label, allLabel }) {
  return (
    <label className="select-input">
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {allLabel ? <option value="all">{allLabel}</option> : null}
        {options.map((o) => (
          <option key={o.id ?? o.value} value={o.id ?? o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={14} className="select-caret" />
    </label>
  )
}
