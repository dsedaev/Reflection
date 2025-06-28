import { useState } from 'react'
import { X, Plus, Trash2, Pencil } from 'lucide-react'
import Modal from './Modal'
import { useMoods } from '../context/MoodsContext'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ManageMoodsModal({ open, onClose }: Props) {
  const { moods, addMood, updateMood, deleteMood } = useMoods()
  const [newMood, setNewMood] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const handleAdd = () => {
    const name = newMood.trim()
    if (!name) return
    addMood(name)
    setNewMood('')
  }

  const handleEditSave = () => {
    if (editId && editValue.trim()) {
      updateMood(editId, editValue.trim())
      setEditId(null)
      setEditValue('')
    }
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">Настроения</h2>
        <button onClick={onClose} className="p-1 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
        {moods.map((m) => (
          <div key={m.id} className="flex items-center justify-between">
            {editId === m.id ? (
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
                <span className="flex-1 text-neutral-900 dark:text-neutral-100">{m.name}</span>
                <button
                  onClick={() => {
                    setEditId(m.id)
                    setEditValue(m.name)
                  }}
                  className="p-1 text-neutral-500 hover:text-primary-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteMood(m.id)}
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
          value={newMood}
          onChange={(e) => setNewMood(e.target.value)}
          placeholder="Новое настроение"
          className="input flex-1"
        />
        <button onClick={handleAdd} className="btn-primary px-3 py-2">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </Modal>
  )
} 