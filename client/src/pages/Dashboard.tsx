import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { api, ApiError } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import NoteEditor from '../components/NoteEditor'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [notes, setNotes] = useState<{ _id: string; content: string; title?: string; createdAt?: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<{ _id: string; content: string } | null>(null)
  const navigate = useNavigate()

  const load = async () => {
    try {
      const r = await api.listNotes()
      setNotes(r.notes)
    } catch (e) {
      setError((e as ApiError).message || 'Failed to load notes')
    }
  }

  useEffect(() => { load() }, [])

  const openCreateNote = () => {
    setEditingNote(null)
    setIsEditorOpen(true)
  }

  const openEditNote = (note: { _id: string; content: string }) => {
    setEditingNote(note)
    setIsEditorOpen(true)
  }

  const handleSaveNote = async (content: string) => {
    setLoading(true)
    try {
      if (editingNote) {
        // Update existing note (if API supports it)
        // For now, we'll just update locally
        setNotes(n => n.map(note => 
          note._id === editingNote._id ? { ...note, content } : note
        ))
      } else {
        // Create new note
        const r = await api.createNote(content)
        setNotes(n => [r.note, ...n])
      }
      setIsEditorOpen(false)
      setEditingNote(null)
    } catch (e) { 
      setError((e as ApiError).message || 'Failed to save note') 
    } finally { 
      setLoading(false) 
    }
  }

  const handleCancelEdit = () => {
    setIsEditorOpen(false)
    setEditingNote(null)
  }

  const del = async (id: string) => {
    try {
      await api.deleteNote(id)
      setNotes(n => n.filter(x => x._id !== id))
    } catch (e) { setError((e as ApiError).message || 'Failed to delete note') }
  }

  const signOut = async () => {
    await logout()
    navigate('/signin')
  }

  // Helper to extract text from HTML
  const extractTextFromHtml = (html: string) => {
    const tmp = document.createElement('div')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="HD" className="w-6 h-6" />
            <span className="font-semibold">Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
            <button className="text-sm link" onClick={signOut}>Sign Out</button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="relative lg:flex lg:items-start gap-6" style={{ minHeight: '600px' }}>
          {/* Left column: centered by default, moves left when editor opens */}
          <div className={`w-full lg:w-[420px] transition-all duration-500 ease-in-out ${isEditorOpen ? 'lg:ml-0 lg:mr-0' : 'lg:mx-auto'}`}>
            <div className="mb-6">
              <button 
                className="btn-primary px-6 py-3 text-base" 
                onClick={openCreateNote}
                disabled={loading}
              >
                + Create Note
              </button>
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-700">Your Notes</h3>
              <div className="grid gap-3" style={{
                gridTemplateColumns: isEditorOpen ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))'
              }}>
                {notes.map(n => (
                  <div 
                    key={n._id} 
                    className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer p-4"
                    onClick={() => openEditNote(n)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {extractTextFromHtml(n.content).slice(0, 50)}...
                      </h4>
                      <button 
                        aria-label="Delete" 
                        className="text-gray-400 hover:text-red-600 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          del(n._id)
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {extractTextFromHtml(n.content)}
                    </p>
                    {n.createdAt && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    <p className="text-lg mb-2">No notes yet</p>
                    <p className="text-sm">Click "Create Note" to get started</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column: editor panel (desktop), slides in when open */}
          <div
            className={`min-h-[600px] transition-all duration-500 ease-in-out overflow-hidden hidden lg:block ${
              isEditorOpen ? 'lg:flex-1 lg:max-w-[100%] lg:opacity-100 lg:translate-x-0' : 'lg:w-0 lg:flex-none lg:opacity-0 lg:translate-x-6 lg:pointer-events-none'
            }`}
          >
            {isEditorOpen && (
              <NoteEditor
                initialContent={editingNote?.content || ''}
                onSave={handleSaveNote}
                onCancel={handleCancelEdit}
                loading={loading}
              />
            )}
          </div>
          {/* Mobile full-screen editor overlay */}
          {isEditorOpen && (
            <div className="fixed inset-0 z-50 bg-white lg:hidden">
              <button
                aria-label="Close editor"
                className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full border shadow-sm text-gray-600 hover:bg-gray-50"
                onClick={handleCancelEdit}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
              <div className="h-full pt-12">
                <NoteEditor
                  initialContent={editingNote?.content || ''}
                  onSave={handleSaveNote}
                  onCancel={handleCancelEdit}
                  loading={loading}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
