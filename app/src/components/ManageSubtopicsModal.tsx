import { useState } from 'react'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import Modal from './Modal'
import { api } from '../utils/api'

interface Subtopic {
  id: number
  name: string
}

interface Props {
  open: boolean
  onClose: () => void
  sectionId: number
  subtopics: Subtopic[]
  onUpdated: () => void // callback после изменения
}

export default function ManageSubtopicsModal({ open, onClose, sectionId, subtopics, onUpdated }: Props) {
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState<number | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    await api.createSubtopic({ name, sectionId })
    setNewName('')
    onUpdated()
  }

  const handleEditSave = async () => {
    if (editId && editValue.trim()) {
      await api.updateSubtopic(editId, { name: editValue.trim() })
      setEditId(null)
      setEditValue('')
      onUpdated()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить подтему?')) return
    await api.deleteSubtopic(id)
    onUpdated()
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Подтемы</h2>
        <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
        {subtopics.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between">
            {editId === sub.id ? (
              <>
                <input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="input flex-1 mr-2"
                />
                <button onClick={handleEditSave} className="btn-primary px-3 py-1 text-xs">Сохранить</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-neutral-900 dark:text-neutral-100">{sub.name}</span>
                <button
                  onClick={() => {
                    setEditId(sub.id)
                    setEditValue(sub.name)
                  }}
                  className="p-1 text-neutral-500 hover:text-primary-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(sub.id)}
                  className="p-1 text-neutral-500 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Новая подтема"
          className="input flex-1"
        />
        <button onClick={handleAdd} className="btn-primary px-3 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  )
} 