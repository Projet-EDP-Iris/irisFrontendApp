import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('irisDesktop', {
  notifySignupSuccess: (payload) => ipcRenderer.invoke('iris:notify-signup-success', payload),
})
