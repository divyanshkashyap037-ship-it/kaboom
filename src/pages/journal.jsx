import { useState } from 'react'
import { AppShell } from '../components/layout/app-shell.jsx'
import { Button, EmptyState, IconButton } from '../components/ui/primitives.jsx'
import { Icon } from '../components/ui/icons.jsx'
import { addJournal, deleteJournal, updateJournal, useBoard } from '../store/board-store.js'
import './pages.css'

export function JournalPage({ onMenu, railOpen }) {
  const { journal } = useBoard()
  const [draft, setDraft] = useState({ title: '', body: '' })
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  const startEdit = (entry) => {
    setEditingId(entry.id)
    setDraft({ title: entry.title, body: entry.body })
  }

  const save = () => {
    if (!draft.body.trim()) {
      setError('Write something first — an empty entry cannot be saved.')
      return
    }
    if (editingId) updateJournal(editingId, { title: draft.title.trim(), body: draft.body.trim() })
    else addJournal({ title: draft.title.trim(), body: draft.body.trim() })
    setEditingId(null)
    setDraft({ title: '', body: '' })
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({ title: '', body: '' })
    setError('')
  }

  return (
    <AppShell
      railOpen={railOpen}
      onMenu={onMenu}
      title="Journal"
      subtitle="Short notes and reflections kept on this device."
      actions={
        editingId ? (
          <Button variant="ghost" icon="x" onClick={cancelEdit}>Cancel edit</Button>
        ) : null
      }
    >
      <section className="panel journal-editor">
        <header className="panel-head">
          <h2><Icon name={editingId ? 'pencil' : 'plus'} size={16} /> {editingId ? 'Edit entry' : 'New entry'}</h2>
        </header>
        <input
          className="journal-title"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Title (optional)"
          aria-label="Journal entry title"
          maxLength={60}
        />
        <textarea
          className="journal-body"
          rows={5}
          value={draft.body}
          onChange={(e) => {
            setDraft((d) => ({ ...d, body: e.target.value }))
            setError('')
          }}
          placeholder="Today…"
          aria-label="Journal entry text"
          maxLength={2000}
        />
        {error ? <span className="field-error"><Icon name="alert" size={13} /> {error}</span> : null}
        <div className="journal-editor-actions">
          <Button icon="check" onClick={save}>{editingId ? 'Update entry' : 'Save entry'}</Button>
          <span className="panel-hint">{draft.body.length}/2000</span>
        </div>
      </section>

      {journal.length === 0 ? (
        <EmptyState icon="journal" title="No entries yet" hint="Write your first entry above — it stays right here on this device." />
      ) : (
        <section className="journal-list">
          {journal.map((entry) => (
            <article key={entry.id} className="journal-entry">
              <header>
                <h3>{entry.title || 'Untitled'}</h3>
                <span className="journal-date">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <div className="journal-actions">
                  <IconButton icon="pencil" label="Edit entry" onClick={() => startEdit(entry)} />
                  <IconButton icon="trash" label="Delete entry" tone="danger" onClick={() => deleteJournal(entry.id)} />
                </div>
              </header>
              <p>{entry.body}</p>
            </article>
          ))}
        </section>
      )}
    </AppShell>
  )
}
