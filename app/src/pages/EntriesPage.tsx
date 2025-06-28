import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { api } from '../utils/api'
import { useMoods } from '../context/MoodsContext'
import EntryCard from '../components/EntryCard'

interface Entry {
  id: number
  title: string
  content: string
  mood?: string
  intensity?: number
  isDraft: boolean
  createdAt: string
  section: { id: number; name: string }
  subtopic?: { id: number; name: string }
  tags: Array<{ tag: { id: number; name: string; color?: string } }>
}

interface Section {
  id: number
  name: string
  subtopics: Array<{ id: number; name: string }>
}

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const { moods } = useMoods()
  const [isLoading, setIsLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()

  // Фильтры
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [selectedSection, setSelectedSection] = useState(searchParams.get('section') || '')
  const [selectedSubtopic, setSelectedSubtopic] = useState(searchParams.get('subtopic') || '')
  const [selectedMood, setSelectedMood] = useState(searchParams.get('mood') || '')

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadEntries()
  }, [searchTerm, selectedSection, selectedSubtopic, selectedMood])

  const loadData = async () => {
    try {
      const [sectionsData, entriesData] = await Promise.all([
        api.getSections(),
        api.getEntries()
      ])
      setSections(sectionsData)
      setEntries(entriesData.entries || [])
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadEntries = async () => {
    try {
      setIsLoading(true)
      const params: any = {}
      
      if (searchTerm) params.search = searchTerm
      if (selectedSection) params.sectionId = parseInt(selectedSection)
      if (selectedSubtopic) params.subtopicId = parseInt(selectedSubtopic)
      if (selectedMood) params.mood = selectedMood

      const data = await api.getEntries(params)
      setEntries(data.entries || [])
    } catch (error) {
      console.error('Ошибка загрузки записей:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEntry = async (entryId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту запись?')) return

    try {
      await api.deleteEntry(entryId)
      setEntries(entries.filter(entry => entry.id !== entryId))
    } catch (error) {
      console.error('Ошибка удаления записи:', error)
    }
  }

  const updateSearchParams = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key, value)
    } else {
      newParams.delete(key)
    }
    setSearchParams(newParams)
  }

  const selectedSectionData = sections.find(s => s.id === parseInt(selectedSection))
  const allSubtopics = sections.flatMap((s)=>s.subtopics)
  const subtopicsList = selectedSection ? (selectedSectionData?.subtopics ?? []) : allSubtopics

  if (isLoading && entries.length === 0) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/4"></div>
          <div className="h-12 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Мои записи
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Найдено записей: {entries.length}
          </p>
        </div>
        <Link
          to="/entries/new"
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Новая запись
        </Link>
      </div>

      {/* Фильтры */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Поиск */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Поиск записей..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                updateSearchParams('search', e.target.value)
              }}
              className="input pl-10"
            />
          </div>

          {/* Раздел */}
          <select
            value={selectedSection}
            onChange={(e) => {
              setSelectedSection(e.target.value)
              setSelectedSubtopic('')
              updateSearchParams('section', e.target.value)
              updateSearchParams('subtopic', '')
            }}
            className="input"
          >
            <option value="">Все разделы</option>
            {sections.map(section => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>

          {/* Подтема */}
          <select
            value={selectedSubtopic}
            onChange={(e) => {
              setSelectedSubtopic(e.target.value)
              updateSearchParams('subtopic', e.target.value)
            }}
            className="input"
          >
            <option value="">Все подтемы</option>
            {subtopicsList.map((sub:any)=> (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          {/* Настроение */}
          <select
            value={selectedMood}
            onChange={(e) => {
              setSelectedMood(e.target.value)
              updateSearchParams('mood', e.target.value)
            }}
            className="input"
          >
            <option value="">Любое настроение</option>
            {moods.map((m)=>(
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Список записей */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              showSection={true}
              showSubtopic={true}
              showEdit={true}
              showDelete={true}
              onEdit={() => window.location.href = `/entries/${entry.id}`}
              onDelete={() => handleDeleteEntry(entry.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-neutral-400 dark:text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Записи не найдены
          </h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">
            Попробуйте изменить параметры поиска или создайте новую запись
          </p>
          <Link
            to="/entries/new"
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Создать запись
          </Link>
        </div>
      )}
    </div>
  )
} 