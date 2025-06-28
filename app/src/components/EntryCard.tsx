import { Calendar, Edit3, Trash2 } from 'lucide-react'
import { useMoods } from '../context/MoodsContext'

interface EntryCardProps {
  entry: {
    id: number
    title: string
    content: string
    createdAt: string
    section?: { name: string }
    subtopic?: { name: string }
    mood?: string
    intensity?: number
  }
  showSection?: boolean
  showSubtopic?: boolean
  showEdit?: boolean
  showDelete?: boolean
  onEdit?: () => void
  onDelete?: () => void
  className?: string
}

export default function EntryCard({
  entry,
  showSection = false,
  showSubtopic = false,
  showEdit = false,
  showDelete = false,
  onEdit,
  onDelete,
  className = ''
}: EntryCardProps) {
  const { moods } = useMoods()
  return (
    <div className={`card hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
            {entry.title || 'Без названия'}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 mb-3 line-clamp-3">
            {entry.content.substring(0, 200)}...
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="badge badge-date">
              <Calendar className="w-4 h-4" />
              {new Date(entry.createdAt).toLocaleDateString('ru-RU')}
            </span>
            {showSection && entry.section && (
              <span className="badge badge-section">{entry.section.name}</span>
            )}
            {showSubtopic && entry.subtopic && (
              <span className="badge badge-subtopic">{entry.subtopic.name}</span>
            )}
            {entry.mood && (
              <span className="badge badge-mood">
                {moods.find((m) => m.id === entry.mood)?.name || entry.mood}
              </span>
            )}
            {entry.intensity !== null && entry.intensity !== undefined && (
              <span className="badge badge-intensity">Интенсивность: {entry.intensity}/10</span>
            )}
          </div>
        </div>
        {(showEdit || showDelete) && (
          <div className="flex items-center gap-2 ml-4">
            {showEdit && (
              <button
                onClick={onEdit}
                className="p-2 text-neutral-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {showDelete && (
              <button
                onClick={onDelete}
                className="p-2 text-neutral-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 