import { app, BrowserWindow, ipcMain, shell, dialog, Menu, Tray, desktopCapturer } from 'electron';
import path from 'path';
import Store from 'electron-store';
import { platform } from 'os';

// Yapılandırma deposu
const store = new Store();

// Geliştirme modunda mı?
const isDev = process.env.NODE_ENV === 'development';

// Ana pencere referansı
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Squirrel başlatma işlemlerini kontrol et
if (require('electron-squirrel-startup')) {
  app.quit();
}

function createWindow() {
  // Ana pencereyi oluştur
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Yükleme tamamlandıktan sonra göster
    frame: true,
    titleBarStyle: platform() === 'darwin' ? 'hiddenInset' : 'default',
    icon: path.join(__dirname, '../assets/icon.png'),
  });

  // İçeriği yükle
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Pencere hazır olduğunda göster
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // Pencere kapatıldığında
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Dış linkleri tarayıcıda aç
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Tray ikonunu oluştur
  createTray();
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Treffy', enabled: false },
    { type: 'separator' },
    { 
      label: 'Pencereyi Göster', 
      click: () => {
        if (mainWindow) {
          mainWindow.show();
        } else {
          createWindow();
        }
      }
    },
    { type: 'separator' },
    { 
      label: 'Çıkış', 
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Treffy');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
      }
    } else {
      createWindow();
    }
  });
}

// IPC iletişimi
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-settings', (_event, key: string) => {
  return store.get(key);
});

ipcMain.handle('set-settings', (_event, key: string, value: any) => {
  store.set(key, value);
  return true;
});

ipcMain.handle('open-file-dialog', async () => {
  if (!mainWindow) return null;
  
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || filePaths.length === 0) {
    return null;
  }
  
  return filePaths[0];
});

// Ekran paylaşımı kaynaklarını al
ipcMain.handle('get-sources', async (event, opts) => {
  try {
    console.log('Electron: Ekran kaynakları isteniyor', opts);
    const sources = await desktopCapturer.getSources(opts);
    console.log('Electron: Kullanılabilir kaynaklar:', sources.length);
    return sources;
  } catch (error) {
    console.error('Electron: Ekran kaynakları alınamadı:', error);
    return [];
  }
});

// Uygulama olayları
app.whenReady().then(() => {
  createWindow();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});