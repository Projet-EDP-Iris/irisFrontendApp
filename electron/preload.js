import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('irisDesktop', {
  notifySignupSuccess: (payload) => ipcRenderer.invoke('iris:notify-signup-success', payload),
  notifyGmailConnected: (payload) => ipcRenderer.invoke('iris:notify-gmail-connected', payload),
  openExternal: (url) => ipcRenderer.invoke('iris:open-external', url),
  onOAuthCallback: (callback) => {
    const handler = (_event, params) => callback(params)
    ipcRenderer.on('iris:oauth-callback', handler)
    return () => ipcRenderer.removeListener('iris:oauth-callback', handler)
  },
})
