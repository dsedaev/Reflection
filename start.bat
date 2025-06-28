@echo off
title Дневник самопознания
echo ========================================
echo     ДНЕВНИК САМОПОЗНАНИЯ
echo ========================================
echo.

REM Останавливаем все процессы Node.js для избежания конфликтов
echo Остановка предыдущих процессов...
taskkill /f /im node.exe >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Сервер API" >nul 2>&1
taskkill /f /im cmd.exe /fi "WINDOWTITLE eq Vite Dev Server" >nul 2>&1

REM Освобождаем порты 3001 и 5173
for /f "tokens=5" %%a in ('netstat -aon ^| find "3001" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| find "5173" ^| find "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

timeout /t 2 /nobreak >nul
echo Процессы остановлены.
echo.

REM Проверяем наличие Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ОШИБКА: Node.js не установлен!
    echo Скачайте и установите Node.js с https://nodejs.org/
    pause
    exit /b 1
)

REM Проверяем наличие папки приложения
if not exist "app" (
    echo ОШИБКА: Папка приложения не найдена!
    pause
    exit /b 1
)

echo Подготовка приложения...

REM Проверяем зависимости в папке приложения
if not exist "app\node_modules" (
    echo Установка зависимостей...
    pushd "app"
    call npm install
    if %errorlevel% neq 0 (
        echo ОШИБКА: Не удалось установить зависимости!
        popd
        pause
        exit /b 1
    )
    popd
)

REM Генерируем Prisma клиент и создаем базу данных
echo Подготовка базы данных...
pushd "app"
call npm run db:generate
if not exist "data\" mkdir data
call npx prisma db push >nul 2>&1
popd

echo.
echo Запуск приложения...

REM Запускаем сервер в отдельном окне
start "Сервер API" cmd /k "cd /d "%~dp0app" && npm run server"

REM Ждем запуска сервера
timeout /t 5 /nobreak >nul

REM Запускаем клиент в отдельном окне
start "Vite Dev Server" cmd /k "cd /d "%~dp0app" && npm run client"

REM Ждем запуска клиента
timeout /t 10 /nobreak >nul

REM Открываем браузер
start http://localhost:5173

echo.
echo ========================================
echo   ПРИЛОЖЕНИЕ ЗАПУЩЕНО!
echo ========================================
echo Сервер API: http://localhost:3001
echo Веб-интерфейс: http://localhost:5173
echo Пароль по умолчанию: password
echo.
echo ВАЖНО: Не закрывайте окна "Сервер API" и "Vite Dev Server"!
echo Для остановки приложения закройте эти окна.
echo.
pause 