import { useEffect, useRef, useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Button } from '../components/ui/primitives.jsx'
import { Icon } from '../components/ui/icons.jsx'
import './pages.css'

const WB_KEY = 'kaboom:whiteboard:v1'

const COLORS = [
  { id: 'Ink', value: '#1f2d3d' },
  { id: 'Blue', value: '#2f7fdd' },
  { id: 'Red', value: '#d84a3e' },
  { id: 'Green', value: '#2f9a6b' },
]

const SIZES = [
  { id: 'Fine', value: 2.5 },
  { id: 'Medium', value: 5 },
  { id: 'Bold', value: 10 },
]

/** Coordinates are stored normalized (0..1) so the canvas scales with the window. */
function loadStrokes() {
  try {
    const raw = localStorage.getItem(WB_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function pathOf(points) {
  if (!points.length) return ''
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(4)} ${p.y.toFixed(4)}`).join(' ')
}

export function WhiteboardPage({ onMenu, railOpen }) {
  const [strokes, setStrokes] = useState(() => loadStrokes())
  const [color, setColor] = useState(COLORS[0].value)
  const [width, setWidth] = useState(SIZES[1].value)
  const svgRef = useRef(null)
  const drawing = useRef(null)

  // Persist the canvas contents to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(WB_KEY, JSON.stringify(strokes))
    } catch {
      /* storage unavailable or full — drawing still works in-session */
    }
  }, [strokes])

  const pointFromEvent = (e) => {
    const rect = svgRef.current.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }

  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    try {
      svgRef.current.setPointerCapture(e.pointerId)
    } catch {
      /* capture is best-effort: synthetic events and some stylus drivers have no active pointer id */
    }
    drawing.current = { id: `s${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, color, width, points: [pointFromEvent(e)] }
    // Seed the preview: the last stroke object is always the one being drawn
    setStrokes((prev) => [...prev, { ...drawing.current, d: '' }])
  }

  const onPointerMove = (e) => {
    if (!drawing.current) return
    drawing.current.points.push(pointFromEvent(e))
    // Capture values before entering the state updater — drawing.current
    // becomes null as soon as the pointer is released.
    const live = drawing.current
    const d = pathOf(live.points)
    setStrokes((prev) => [...prev.slice(0, prev.length - 1), { ...live, d }])
  }

  const onPointerUp = () => {
    if (!drawing.current) return
    const done = { ...drawing.current, d: pathOf(drawing.current.points) }
    drawing.current = null
    setStrokes((prev) => [...prev.slice(0, prev.length - 1), done])
  }

  const undo = () => setStrokes((prev) => prev.slice(0, -1))

  const clearAll = () => {
    if (strokes.length && window.confirm('Clear the entire whiteboard?')) setStrokes([])
  }

  return (
    <AppShell
      railOpen={railOpen}
      onMenu={onMenu}
      title="Whiteboard"
      subtitle="Sketch freely — strokes are saved automatically."
      actions={
        <>
          <Button variant="ghost" icon="copy" onClick={undo}>Undo</Button>
          <Button variant="ghost" icon="trash" className="danger" onClick={clearAll}>Clear all</Button>
        </>
      }
    >
      <div className="toolbar board-tools">
        <div className="texture-group" role="radiogroup" aria-label="Pen color">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={color === c.value}
              className={`tool-dot${color === c.value ? ' selected' : ''}`}
              style={{ background: c.value }}
              onClick={() => setColor(c.value)}
              aria-label={`Pen color ${c.id}`}
            />
          ))}
        </div>
        <div className="texture-group" role="radiogroup" aria-label="Stroke width">
          {SIZES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={width === s.value}
              className={`tool-size${width === s.value ? ' selected' : ''}`}
              onClick={() => setWidth(s.value)}
              aria-label={`Stroke width ${s.id}`}
            >
              <span style={{ height: `${s.value + 2}px`, width: `${s.value + 2}px` }} />
            </button>
          ))}
        </div>
        <span className="panel-hint">{strokes.length} stroke{strokes.length === 1 ? '' : 's'}</span>
      </div>

      <div className="whiteboard-surface">
        <svg
          ref={svgRef}
          className="whiteboard-canvas"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="img"
          aria-label="Whiteboard drawing surface"
        >
          {strokes.map((s) => (
            <path
              key={s.id}
              d={s.d}
              fill="none"
              stroke={s.color}
              strokeWidth={s.width}
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </svg>
        {strokes.length === 0 ? (
          <div className="whiteboard-hint" aria-hidden="true">
            <Icon name="whiteboard" size={26} strokeWidth={1.4} />
            <p>Draw here with your mouse, pen or finger</p>
          </div>
        ) : null}
      </div>
    </AppShell>
  )
}
