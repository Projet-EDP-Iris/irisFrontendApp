import { app, BrowserWindow, ipcMain, Notification } from 'electron'
import fs from 'fs'
import { fileURLToPath, pathToFileURL } from 'url'
import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { autoUpdater } = require('electron-updater')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const distDir = path.resolve(__dirname, '..', 'dist')
const rendererEntry = path.join(distDir, 'index.html')

const isDev = !app.isPackaged
const rendererEntryUrl = pathToFileURL(rendererEntry).toString()

function isAllowedRendererNavigation(url) {
  try {
    const destination = new URL(url)
    const expected = new URL(rendererEntryUrl)
    const sameFile =
      destination.protocol === expected.protocol &&
      destination.pathname === expected.pathname

    return sameFile || destination.href === 'about:blank'
  } catch {
    return false
  }
}

function attachProductionDiagnostics(win) {
  win.webContents.on('did-start-loading', () => {
    console.log('[electron] renderer started loading')
  })

  win.webContents.on('did-finish-load', () => {
    console.log('[electron] renderer finished loading', win.webContents.getURL())
  })

  win.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('[electron] renderer failed to load', {
      errorCode,
      errorDescription,
      validatedURL,
      currentURL: win.webContents.getURL(),
    })
    win.webContents.openDevTools({ mode: 'detach' })
    win.show()
  })

  win.webContents.on('did-navigate', (_event, url) => {
    console.log('[electron] renderer navigated', url)
  })

  win.webContents.on('will-navigate', (event, url) => {
    if (isAllowedRendererNavigation(url)) return

    console.error('[electron] blocked unexpected top-level navigation', {
      targetURL: url,
      currentURL: win.webContents.getURL(),
    })
    event.preventDefault()
  })

  win.webContents.on('did-redirect-navigation', (_event, url, isInPlace, isMainFrame) => {
    console.log('[electron] renderer redirect', { url, isInPlace, isMainFrame })
  })

  win.webContents.on('console-message', (_event, level, message, line, sourceId) => {
    console.log('[renderer-console]', { level, message, line, sourceId })
  })

  win.webContents.on('render-process-gone', (_event, details) => {
    console.error('[electron] renderer process gone', details)
  })
}

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
    attachProductionDiagnostics(win)

    console.log('[electron] production renderer entry', {
      appPath: app.getAppPath(),
      distDir,
      rendererEntry,
      rendererEntryUrl,
      rendererEntryExists: fs.existsSync(rendererEntry),
    })

    win.loadFile(rendererEntry).catch((error) => {
      console.error('[electron] loadFile failed', error)
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

ipcMain.handle('iris:notify-gmail-connected', (_event, payload = {}) => {
  if (!Notification.isSupported()) {
    return { shown: false, reason: 'unsupported' }
  }

  const gmailEmail = typeof payload.gmailEmail === 'string' ? payload.gmailEmail.trim() : ''
  const soundEnabled = payload.soundEnabled !== false
  const body = gmailEmail
    ? `Connected to ${gmailEmail}. Your inbox is ready in Iris.`
    : 'Your Gmail account is connected. Your inbox is ready in Iris.'

  const notification = new Notification({
    title: 'Gmail connected',
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
