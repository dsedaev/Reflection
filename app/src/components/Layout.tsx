import { ReactNode, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  Settings, 
  Moon, 
  Sun, 
  Menu, 
  X,
  LogOut 
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const { isDarkMode, toggleTheme } = useTheme()
  const location = useLocation()

  const navigation = [
    { name: 'Главная', href: '/', icon: Home },
    { name: 'Записи', href: '/entries', icon: BookOpen },
    { name: 'Настройки', href: '/settings', icon: Settings },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Мобильная навигация */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Дневник самопознания
          </h1>
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Сайдбар overlay для мобильных */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
          <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-neutral-800 shadow-xl">
            <SidebarContent 
              navigation={navigation}
              isActive={isActive}
              logout={logout}
              toggleTheme={toggleTheme}
              isDarkMode={isDarkMode}
              onClose={() => setSidebarOpen(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* Десктопный сайдбар */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:dark:bg-neutral-800 lg:border-r lg:border-neutral-200 lg:dark:border-neutral-700">
        <SidebarContent 
          navigation={navigation}
          isActive={isActive}
          logout={logout}
          toggleTheme={toggleTheme}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Основной контент */}
      <div className="lg:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  navigation: Array<{ name: string; href: string; icon: any }>
  isActive: (href: string) => boolean
  logout: () => void
  toggleTheme: () => void
  isDarkMode: boolean
  onClose?: () => void
  isMobile?: boolean
}

function SidebarContent({ 
  navigation, 
  isActive, 
  logout, 
  toggleTheme, 
  isDarkMode, 
  onClose, 
  isMobile 
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          Дневник самопознания
        </h1>
        {isMobile && (
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onClose}
              className={`
                flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors
                ${isActive(item.href)
                  ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }
              `}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Нижние кнопки */}
      <div className="p-4 border-t border-neutral-200 dark:border-neutral-700 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
        >
          {isDarkMode ? (
            <>
              <Sun className="mr-3 h-5 w-5" />
              Светлая тема
            </>
          ) : (
            <>
              <Moon className="mr-3 h-5 w-5" />
              Тёмная тема
            </>
          )}
        </button>
        
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Выйти
        </button>
      </div>
    </div>
  )
} 