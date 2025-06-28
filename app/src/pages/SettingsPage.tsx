import { useState } from 'react'
import { Download, Upload, Key, Save } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { api } from '../utils/api'

export default function SettingsPage() {
  const { changePassword } = useAuth()
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')

  const handlePasswordChange = async (e: any) => {
    e.preventDefault()
    setPasswordMessage('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage('Новые пароли не совпадают')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordMessage('Новый пароль должен содержать минимум 6 символов')
      return
    }

    try {
      setIsChangingPassword(true)
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      
      if (result.success) {
        setPasswordMessage('Пароль успешно изменен')
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage(result.error || 'Ошибка при смене пароля')
      }
    } catch (error) {
      setPasswordMessage('Ошибка при смене пароля')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleExport = async () => {
    try {
      const data = await api.exportData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reflection-diary-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Ошибка при экспорте данных')
    }
  }

  const handleImport = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await api.importData(data)
      alert('Данные успешно импортированы')
    } catch (error) {
      alert('Ошибка при импорте данных')
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          Настройки
        </h1>

        <div className="space-y-8">
          {/* Смена пароля */}
          <div className="card">
            <div className="flex items-center mb-6">
              <Key className="w-5 h-5 text-primary-600 dark:text-primary-400 mr-3" />
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Смена пароля
              </h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Текущий пароль
                </label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Подтвердите новый пароль
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="input"
                  required
                />
              </div>

              {passwordMessage && (
                <div className={`p-3 rounded-lg text-sm ${
                  passwordMessage.includes('успешно') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
                }`}>
                  {passwordMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="btn-primary"
              >
                <Save className="w-4 h-4 mr-2" />
                {isChangingPassword ? 'Изменение...' : 'Изменить пароль'}
              </button>
            </form>
          </div>

          {/* Экспорт и импорт */}
          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-6">
              Резервное копирование
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Экспорт данных
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Скачайте все ваши записи в формате JSON для создания резервной копии
                </p>
                <button onClick={handleExport} className="btn-primary">
                  <Download className="w-4 h-4 mr-2" />
                  Экспортировать данные
                </button>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Импорт данных
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
                  Восстановите данные из файла резервной копии
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file" className="btn-secondary cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Выбрать файл
                  </label>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Только .json файлы
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Информация */}
          <div className="card">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              О приложении
            </h2>
            <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
              <p>Дневник самопознания v1.0</p>
              <p>Локальное приложение для структурированного ведения дневника</p>
              <p>Все данные хранятся на вашем устройстве</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 