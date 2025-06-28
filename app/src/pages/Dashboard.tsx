import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FolderPlus, AlignLeft, Clock, Flame, SmilePlus } from 'lucide-react'
import { api } from '../utils/api'
import ManageMoodsModal from '../components/ManageMoodsModal'
import ManageSubtopicsModal from '../components/ManageSubtopicsModal'
import EntryCard from '../components/EntryCard'

interface Section {
  id: number
  name: string
  description: string
  order: number
  _count: { entries: number }
  subtopics: Array<{ id: number; name: string }>
}

interface Entry {
  id: number
  title: string
  content: string
  createdAt: string
  section: { name: string }
  mood?: string
  subtopic?: { id: number; name: string }
  intensity?: number
}

export default function Dashboard() {
  const [sections, setSections] = useState<Section[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)
  const [sectionEntries, setSectionEntries] = useState<Entry[]>([])
  const [totalWords, setTotalWords] = useState(0)
  const [daysSinceFirst, setDaysSinceFirst] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [showMoodsModal, setShowMoodsModal] = useState(false)
  const [showSubModal, setShowSubModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [sectionsData, , allEntriesData] = await Promise.all([
        api.getSections(),
        api.getEntries({ limit: 5 }),
        api.getEntries({ limit: 10000 })
      ])
      
      setSections(sectionsData)

      const allEntries: Entry[] = allEntriesData.entries || []

      const words = allEntries.reduce((sum, e) => {
        const cnt = e.content.split(/\s+/).filter(Boolean).length
        return sum + cnt
      }, 0)
      setTotalWords(words)

      if (allEntries.length > 0) {
        const sorted = [...allEntries].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        const firstDate = new Date(sorted[0].createdAt)
        const now = new Date()
        const diffDays = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
        setDaysSinceFirst(diffDays)

        const daysSet = new Set<string>()
        allEntries.forEach((e) => {
          const dayStr = new Date(e.createdAt).toISOString().split('T')[0]
          daysSet.add(dayStr)
        })
        const uniqueDays = Array.from(daysSet).sort()
        let maxStreak = 0
        let currentStreak = 0
        let prevDate: Date | null = null
        uniqueDays.forEach((d) => {
          const dateObj = new Date(d)
          if (prevDate) {
            const diff = (dateObj.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
            currentStreak = diff === 1 ? currentStreak + 1 : 1
          } else {
            currentStreak = 1
          }
          maxStreak = Math.max(maxStreak, currentStreak)
          prevDate = dateObj
        })
        setLongestStreak(maxStreak)
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSectionEntries = async (sectionId: number) => {
    try {
      const data = await api.getEntries({ sectionId, limit: 1000 })
      setSectionEntries(data.entries || [])
    } catch (error) {
      console.error('Ошибка загрузки записей раздела:', error)
    }
  }

  const handleSelectSection = (section: Section) => {
    setSelectedSection(section)
    loadSectionEntries(section.id)
  }

  const refreshSection = async () => {
    if (!selectedSection) return
    const fresh = await api.getSections()
    const updated = fresh.find((s: any) => s.id === selectedSection.id)
    if (updated) setSelectedSection(updated)
  }

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Добро пожаловать в ваш дневник
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Исследуйте себя через структурированную рефлексию
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Всего слов */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
              <AlignLeft className="w-6 h-6 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                 Вы написали
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                 {totalWords.toLocaleString('ru-RU')} <span className="text-base font-medium">слов</span>
              </p>
            </div>
          </div>
        </div>

        {/* Дней с первой записи */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-accent-100 dark:bg-accent-900 rounded-lg">
              <Clock className="w-6 h-6 text-accent-600 dark:text-accent-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                 Вы начали вести дневник
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                 {daysSinceFirst} <span className="text-base font-medium">дней назад</span>
              </p>
            </div>
          </div>
        </div>

        {/* Максимальный стрик */}
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Flame className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                 Самый долгий период ведения
              </p>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                 {longestStreak} <span className="text-base font-medium">дней</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Разделы */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-0">
              Разделы<br/>самопознания
            </h2>
          </div>

          <div className="space-y-3">
            {sections.map((section) => (
              <div
                key={section.id}
                onClick={() => handleSelectSection(section)}
                className={`block p-4 cursor-pointer bg-white dark:bg-neutral-800 border rounded-lg transition-colors ${
                  selectedSection?.id === section.id
                    ? 'border-primary-400 dark:border-primary-500'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                      {section.name}
                    </h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                      {section.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {section._count.entries}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      записей
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Правая панель */}
        <div>
          {/* Если раздел выбран – отображаем его подтемы и записи */}
          {selectedSection ? (
            <>
              <div className="flex items-center justify-between mb-4 -mt-1">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mt-0">
                  {selectedSection.name}
                </h2>
                <div className="flex gap-2">
                  <Link
                    to={`/entries/new?sectionId=${selectedSection.id}`}
                    className="btn-primary text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Запись
                  </Link>
                  <button onClick={() => setShowSubModal(true)} className="btn-secondary text-sm">
                    <FolderPlus className="w-4 h-4 mr-1" /> Подтема
                  </button>
                  <button onClick={() => setShowMoodsModal(true)} className="btn-secondary text-sm">
                    <SmilePlus className="w-4 h-4 mr-1" /> Настроение
                  </button>
                </div>
              </div>

              {/* Вывод подтем и записей */}
              {selectedSection.subtopics.length === 0 && sectionEntries.length === 0 ? (
                <p className="text-neutral-600 dark:text-neutral-400">Нет записей</p>
              ) : (
                <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                  {/* Подтемы */}
                  {selectedSection.subtopics.map((sub) => {
                    const entriesOfSub = sectionEntries.filter((en) => en.subtopic && en.subtopic.id === sub.id)
                    return (
                      <div key={sub.id} className="space-y-3">
                        <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                          {sub.name}
                        </h3>
                        {entriesOfSub.length > 0 ? (
                          <div className="space-y-2">
                            {entriesOfSub.map((entry) => (
                              <EntryCard
                                key={entry.id}
                                entry={entry}
                                showSection={false}
                                showSubtopic={false}
                                showEdit={false}
                                showDelete={false}
                                className="p-4"
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Нет записей</p>
                        )}
                      </div>
                    )
                  })}

                  {/* Записи без подтемы */}
                  {sectionEntries.filter((e) => !e.subtopic).length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Без подтемы</h3>
                      {sectionEntries
                        .filter((e) => !e.subtopic)
                        .map((entry) => (
                          <EntryCard
                            key={entry.id}
                            entry={entry}
                            showSection={false}
                            showSubtopic={false}
                            showEdit={false}
                            showDelete={false}
                            className="p-4"
                          />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Нет выбранного раздела – показываем последние записи как было */
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Последние<br/>записи
              </h2>
              <Link
                to="/entries"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium"
              >
                Смотреть все
              </Link>
            </div>
          )}
        </div>
      </div>
      {selectedSection && (
        <ManageSubtopicsModal
          open={showSubModal}
          onClose={() => setShowSubModal(false)}
          sectionId={selectedSection.id}
          subtopics={selectedSection.subtopics}
          onUpdated={() => {
            refreshSection()
            setShowSubModal(false)
          }}
        />
      )}
      <ManageMoodsModal open={showMoodsModal} onClose={() => setShowMoodsModal(false)} />
    </div>
  )
} 