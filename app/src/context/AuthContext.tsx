import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '../utils/api'

interface User {
  id: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Проверяем сохраненный токен при загрузке
    const savedToken = sessionStorage.getItem('auth_token')
    if (savedToken) {
      setToken(savedToken)
      api.setAuthToken(savedToken)
      // Можно добавить проверку валидности токена
    }
    setIsLoading(false)
  }, [])

  const login = async (password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)
      const response = await api.post('/auth/login', { password })
      
      if (response.token) {
        setToken(response.token)
        setUser(response.user)
        sessionStorage.setItem('auth_token', response.token)
        api.setAuthToken(response.token)
        return { success: true }
      } else {
        return { success: false, error: 'Неверный ответ сервера' }
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Ошибка авторизации' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    sessionStorage.removeItem('auth_token')
    api.setAuthToken(null)
  }

  const changePassword = async (
    currentPassword: string, 
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Ошибка при смене пароля' 
      }
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    changePassword,
    isLoading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 