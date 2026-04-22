import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { autoUpdater } = require('electron-updater')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'default',
    show: false,
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))

    win.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      console.error('Failed to load:', errorCode, errorDescription)
      win.webContents.openDevTools()
      win.show()
    })
  }

  win.once('ready-to-show', () => {
    win.show()
  })
}

ipcMain.handle('iris:notify-signup-success', (_event, payload = {}) => {
  if (!Notification.isSupported()) {
    return { shown: false, reason: 'unsupported' }
  }

  const userName = typeof payload.userName === 'string' ? payload.userName.trim() : ''
  const soundEnabled = payload.soundEnabled !== false
  const body = userName
    ? `Welcome ${userName}, your account is ready.`
    : 'Your account was created successfully.'

  const notification = new Notification({
    title: 'Welcome to Iris',
    body,
    silent: !soundEnabled,
  })

  notification.show()
  return { shown: true }
})

app.whenReady().then(() => {
  createWindow()

  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
