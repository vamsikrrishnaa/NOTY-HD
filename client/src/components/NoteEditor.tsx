import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import TextAlign from '@tiptap/extension-text-align'

interface NoteEditorProps {
  initialContent?: string
  onSave: (content: string) => void
  onCancel: () => void
  loading?: boolean
}

export default function NoteEditor({ initialContent = '', onSave, onCancel, loading }: NoteEditorProps) {
  const editor = useEditor({
    extensions: [
      // Base
      StarterKit,
      // Text decorations
      Underline,
      Highlight,
      TextStyle,
      Color,
      // Links
      Link.configure({
        openOnClick: true,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: '_blank' },
      }),
      // Tasks
      TaskList,
      TaskItem,
      // Alignment
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Start writing your note...',
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] p-6',
      },
    },
  })

  const handleSave = () => {
    if (!editor) return
    const content = editor.getHTML()
    if (content && content !== '<p></p>') {
      onSave(content)
    }
  }

  const setLink = () => {
    if (!editor) return
    const prev = editor.getAttributes('link').href || ''
    const url = window.prompt('Enter URL', prev)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().unsetLink().run()
      return
    }
    // Basic normalization
    const href = /^https?:\/\//i.test(url) ? url : `https://${url}`
    editor.chain().focus().setLink({ href }).run()
  }

  return (
    <div className="bg-white rounded-xl shadow-lg h-full flex flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Note Editor</h2>
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        {editor && (
          <div className="mt-3 flex items-center gap-2 flex-wrap overflow-x-auto">
            {/* Undo/Redo */}
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>Undo</button>
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>Redo</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Basic formatting */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('bold') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 italic ${editor.isActive('italic') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 underline ${editor.isActive('underline') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 line-through ${editor.isActive('strike') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleStrike().run()}>S</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('code') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleCode().run()}>Code</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('highlight') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>
            <label className="px-2 py-1 text-sm border rounded hover:bg-gray-50 cursor-pointer">
              <span className="mr-1 text-gray-600">Color</span>
              <input type="color" className="w-6 h-6 p-0 border-0 align-middle" onChange={(e)=>editor.chain().focus().setColor(e.target.value).run()} />
            </label>
            <span className="mx-1 text-gray-300">|</span>
            {/* Headings */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('paragraph') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().setParagraph().run()}>P</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Alignment */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().setTextAlign('left').run()}>Left</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().setTextAlign('center').run()}>Center</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().setTextAlign('right').run()}>Right</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Lists */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('bulletList') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('orderedList') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('taskList') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleTaskList().run()}>☑ Tasks</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Blocks */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('blockquote') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleBlockquote().run()}>Quote</button>
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('codeBlock') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>Code Block</button>
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().setHorizontalRule().run()}>HR</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Links */}
            <button className={`px-2 py-1 text-sm border rounded hover:bg-gray-50 ${editor.isActive('link') ? 'bg-blue-50 text-blue-600' : ''}`} onClick={setLink}>Link</button>
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().unsetLink().run()}>Unlink</button>
            <span className="mx-1 text-gray-300">|</span>
            {/* Clear */}
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().unsetAllMarks().run()}>Clear Marks</button>
            <button className="px-2 py-1 text-sm border rounded hover:bg-gray-50" onClick={() => editor.chain().focus().clearNodes().run()}>Clear Nodes</button>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
