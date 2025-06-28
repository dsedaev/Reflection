import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface Mood {
  id: string // slug
  name: string
}

interface MoodsContextType {
  moods: Mood[]
  addMood: (name: string) => void
  updateMood: (id: string, name: string) => void
  deleteMood: (id: string) => void
}

const defaultMoods: Mood[] = [
  { id: 'happy', name: 'Радость' },
  { id: 'sad', name: 'Грусть' },
  { id: 'neutral', name: 'Нейтрально' },
  { id: 'excited', name: 'Волнение' },
  { id: 'anxious', name: 'Тревога' },
]

const MoodsContext = createContext<MoodsContextType | undefined>(undefined)

export function MoodsProvider({ children }: { children: ReactNode }) {
  const [moods, setMoods] = useState<Mood[]>(() => {
    const saved = localStorage.getItem('moods')
    if (saved) return JSON.parse(saved) as Mood[]
    return defaultMoods
  })

  useEffect(() => {
    localStorage.setItem('moods', JSON.stringify(moods))
  }, [moods])

  const addMood = (name: string) => {
    const slug = name.trim().toLowerCase().replace(/\s+/g, '-')
    if (moods.find((m) => m.id === slug)) return
    setMoods([...moods, { id: slug, name }])
  }

  const updateMood = (id: string, name: string) => {
    setMoods(moods.map((m) => (m.id === id ? { ...m, name } : m)))
  }

  const deleteMood = (id: string) => {
    setMoods(moods.filter((m) => m.id !== id))
  }

  return (
    <MoodsContext.Provider value={{ moods, addMood, updateMood, deleteMood }}>
      {children}
    </MoodsContext.Provider>
  )
}

export function useMoods() {
  const ctx = useContext(MoodsContext)
  if (!ctx) throw new Error('useMoods must be used within MoodsProvider')
  return ctx
} 