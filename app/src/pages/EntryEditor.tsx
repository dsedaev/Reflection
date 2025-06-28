import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Save, X, Eye, EyeOff } from 'lucide-react'
import { api } from '../utils/api'
import { useMoods } from '../context/MoodsContext'

interface EntryForm {
  title: string
  content: string
  sectionId: string
  subtopicId: string
  mood: string
  intensity: string
  tagIds: number[]
  isDraft: boolean
}

export default function EntryEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const location = useLocation()
  const sectionIdParam = new URLSearchParams(location.search).get('sectionId') || ''

  const [entry, setEntry] = useState<EntryForm>({
    title: '',
    content: '',
    sectionId: sectionIdParam,
    subtopicId: '',
    mood: '',
    intensity: '',
    tagIds: [],
    isDraft: false
  })

  const [sections, setSections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { moods } = useMoods()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (isEditing && id) {
      loadEntry(parseInt(id))
    }
  }, [isEditing, id])

  const loadData = async () => {
    try {
      const [sectionsData] = await Promise.all([
        api.getSections()
      ])
      setSections(sectionsData)
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    }
  }

  const loadEntry = async (entryId: number) => {
    try {
      setIsLoading(true)
      const data = await api.getEntry(entryId)
      setEntry({
        title: data.title || '',
        content: data.content || '',
        sectionId: data.sectionId.toString(),
        subtopicId: data.subtopicId?.toString() || '',
        mood: data.mood || '',
        intensity: data.intensity?.toString() || '',
        tagIds: data.tags.map((t: any) => t.tag.id),
        isDraft: data.isDraft || false
      })
    } catch (error) {
      console.error('Ошибка загрузки записи:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (isDraft = false) => {
    if (!entry.content.trim()) {
      alert('Содержание записи не может быть пустым')
      return
    }

    if (!entry.sectionId) {
      alert('Выберите раздел')
      return
    }

    try {
      setIsSaving(true)
      const data = {
        title: entry.title || undefined,
        content: entry.content,
        sectionId: parseInt(entry.sectionId),
        subtopicId: entry.subtopicId ? parseInt(entry.subtopicId) : undefined,
        mood: entry.mood || undefined,
        intensity: entry.intensity ? parseInt(entry.intensity) : undefined,
        tagIds: entry.tagIds,
        isDraft
      }

      if (isEditing) {
        await api.updateEntry(parseInt(id as string), data)
      } else {
        await api.createEntry(data)
      }

      navigate('/entries')
    } catch (error) {
      console.error('Ошибка сохранения:', error)
      alert('Ошибка при сохранении записи')
    } finally {
      setIsSaving(false)
    }
  }

  const selectedSection = sections.find(s => s.id === parseInt(entry.sectionId))

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
          {isEditing ? 'Редактировать запись' : 'Новая запись'}
        </h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-ghost"
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Редактор' : 'Предпросмотр'}
          </button>
          <button
            onClick={() => navigate('/entries')}
            className="btn-secondary"
          >
            <X className="w-4 h-4 mr-2" />
            Отмена
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="card">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Основная форма */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Название (опционально)
                </label>
                <input
                  type="text"
                  value={entry.title}
                  onChange={(e) => setEntry({ ...entry, title: e.target.value })}
                  placeholder="Введите название записи"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Содержание *
                </label>
                {showPreview ? (
                  <div className="min-h-[400px] p-4 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-50 dark:bg-neutral-800">
                    <div className="prose dark:prose-invert max-w-none">
                      {entry.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={entry.content}
                    onChange={(e) => setEntry({ ...entry, content: e.target.value })}
                    placeholder="Начните писать..."
                    className="textarea min-h-[400px]"
                  />
                )}
              </div>
            </div>

            {/* Боковая панель с настройками */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Раздел *
                </label>
                <select
                  value={entry.sectionId}
                  onChange={(e) => setEntry({ ...entry, sectionId: e.target.value, subtopicId: '' })}
                  className="input"
                >
                  <option value="">Выберите раздел</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedSection?.subtopics?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Подтема
                  </label>
                  <select
                    value={entry.subtopicId}
                    onChange={(e) => setEntry({ ...entry, subtopicId: e.target.value })}
                    className="input"
                  >
                    <option value="">Выберите подтему</option>
                    {selectedSection.subtopics.map((subtopic: any) => (
                      <option key={subtopic.id} value={subtopic.id}>
                        {subtopic.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Настроение
                </label>
                <select
                  value={entry.mood}
                  onChange={(e) => setEntry({ ...entry, mood: e.target.value })}
                  className="input"
                >
                  <option value="">Выберите настроение</option>
                  {moods.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Интенсивность (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={entry.intensity}
                  onChange={(e) => setEntry({ ...entry, intensity: e.target.value })}
                  className="input"
                />
              </div>

              <div className="pt-6 border-t border-neutral-200 dark:border-neutral-700">
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => handleSave(false)}
                    disabled={isSaving}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                  </button>
                  
                  <button
                    onClick={() => handleSave(true)}
                    disabled={isSaving}
                    className="btn-secondary"
                  >
                    Сохранить как черновик
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 