const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');

let mainWindow;
let serverProcess;

// Включаем живую перезагрузку для разработки
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  // Создаем окно браузера
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true
    },
    icon: path.join(__dirname, '../public/icons/icon.png'),
    title: 'Дневник самопознания',
    show: false // Не показываем окно пока не загрузится
  });

  // Скрываем меню по умолчанию
  Menu.setApplicationMenu(null);

  // Показываем окно когда готово
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Загружаем приложение
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Открываем внешние ссылки в браузере
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  return new Promise((resolve, reject) => {
    const serverPath = path.join(__dirname, '../server/index.js');
    
    // Проверяем существует ли серверный файл
    if (!fs.existsSync(serverPath)) {
      reject(new Error('Серверный файл не найден'));
      return;
    }

    // Запускаем сервер
    serverProcess = spawn('node', [serverPath], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe'
    });

    serverProcess.stdout.on('data', (data) => {
      console.log(`Сервер: ${data}`);
      if (data.toString().includes('Сервер запущен')) {
        resolve();
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error(`Ошибка сервера: ${data}`);
    });

    serverProcess.on('close', (code) => {
      console.log(`Сервер завершен с кодом ${code}`);
    });

    // Таймаут для запуска сервера
    setTimeout(() => {
      resolve(); // Разрешаем даже если не получили подтверждение
    }, 3000);
  });
}

// Этот метод будет вызван когда Electron завершит инициализацию
app.whenReady().then(async () => {
  try {
    // Сначала запускаем сервер
    await startServer();
    
    // Затем создаем окно
    createWindow();

    app.on('activate', () => {
      // На macOS принято пересоздавать окно при клике на иконку в доке
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Ошибка запуска:', error);
    dialog.showErrorBox('Ошибка запуска', 'Не удалось запустить сервер приложения');
    app.quit();
  }
});

// Выходим когда все окна закрыты
app.on('window-all-closed', () => {
  // На macOS приложения обычно остаются активными даже когда все окна закрыты
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Завершаем серверный процесс при выходе
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Обработка ошибок
process.on('uncaughtException', (error) => {
  console.error('Необработанная ошибка:', error);
}); 