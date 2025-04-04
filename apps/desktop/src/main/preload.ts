// Electron preload script
import { contextBridge, ipcRenderer } from 'electron';

// Güvenli bir şekilde ana işlemle iletişim kurabilecek API'ları tanımla
contextBridge.exposeInMainWorld('electron', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getSettings: (key: string) => ipcRenderer.invoke('get-settings', key),
  setSettings: (key: string, value: any) => ipcRenderer.invoke('set-settings', key, value),
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  
  // Ekran paylaşımı için eklenen fonksiyonlar
  getScreenSources: (opts: { types: string[], thumbnailSize: { width: number, height: number } }) => {
    return ipcRenderer.invoke('get-sources', opts);
  },
  
  // İşletim sistemi bilgisini al
  getOsInfo: () => {
    const osType = process.platform;
    return {
      isMac: osType === 'darwin',
      isWindows: osType === 'win32',
      isLinux: osType === 'linux',
      platform: osType
    };
  }
});

// ipcRenderer'e doğrudan erişmek istersek (Geliştirme modunda)
if (process.env.NODE_ENV === 'development') {
  // @ts-ignore
  window.ipcRenderer = ipcRenderer;
}