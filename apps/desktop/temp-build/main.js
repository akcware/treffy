const { app, BrowserWindow, desktopCapturer, ipcMain, nativeImage } = require('electron');
// MediaStream nesnelerini pencereler arasında paylaşabilmek için global değişken
global.sharedObjects = {
  // Ekran paylaşımı için streamler burada saklanacak
  streams: new Map()
};
const path = require('path');

// Global değişken olarak oluştur, böylece tüm modüllerden erişilebilir
let mainWindow;
let screenShareWindow = null;

// MacOS için dock ikonu başlangıçta ayarlanamaz, app.whenReady() içinde yapılacak

// Kamera ve mikrofon erişimi için Electron izinlerini yapılandır
app.commandLine.appendSwitch('enable-features', 'MediaStreamAPI,GetUserMedia');
app.commandLine.appendSwitch('enable-media-stream');

// Electron uygulamasını başlat
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, 'src/assets/icon.png'),
    title: 'Treffy',
    titleBarStyle: 'hidden', // MacOS'ta title bar'ı gizle, sadece traffic lights göster
    trafficLightPosition: { x: 16, y: 16 }, // MacOS traffic lights pozisyonu
    frame: process.platform !== 'darwin', // MacOS'ta frame'i kaldır, Windows/Linux'ta koru
    transparent: process.platform === 'darwin',
    vibrancy: process.platform === 'darwin' ? 'under-window' : null, // MacOS için vibrancy efekti
    visualEffectState: 'active', // Vibrancy efekti her zaman aktif olsun
    backgroundColor: process.platform === 'darwin' ? '#00ffffff' : '#fff', // MacOS için transparan
    webPreferences: {
      nodeIntegration: true, // MacOS ekran paylaşımı için true
      contextIsolation: false, // MacOS ekran paylaşımı için false
      enableRemoteModule: true, // Remote modülünü etkinleştir
      webSecurity: true,
      allowRunningInsecureContent: false,
      mediaPermissions: true, // Medya izinlerini etkinleştir
      permissions: {
        media: true // Kamera/mikrofon izinleri etkinleştir
      }
    }
  });
  
  // MacOS için ekran paylaşımı izni
  app.commandLine.appendSwitch('enable-features', 'ScreenCapturer');
  
  // Ekran paylaşımı penceresi oluşturma işlevi
  ipcMain.handle('open-screen-share-window', async (event, { streamId, title }) => {
    try {
      console.log('Ekran paylaşımı penceresi oluşturuluyor, streamId:', streamId);
      
      // Eğer zaten bir ekran paylaşımı penceresi açıksa, kapat
      if (screenShareWindow && !screenShareWindow.isDestroyed()) {
        screenShareWindow.close();
      }
      
      // Yeni bir pencere oluştur
      screenShareWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: title || 'Ekran Paylaşımı',
        autoHideMenuBar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false
        }
      });
      
      // Özel HTML sayfası yükle
      screenShareWindow.loadURL('about:blank');
      
      // Pencere yüklendikten sonra
      screenShareWindow.webContents.once('did-finish-load', () => {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${title || 'Ekran Paylaşımı'}</title>
          <style>
            body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              background-color: #000;
              display: flex;
              flex-direction: column;
              height: 100vh;
              width: 100vw;
              font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            }
            
            .header {
              background-color: #1a1a1a;
              color: white;
              padding: 8px 16px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              z-index: 10;
            }
            
            .container {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
            }
            
            .message {
              color: white;
              background-color: rgba(0,0,0,0.7);
              padding: 20px;
              border-radius: 8px;
              text-align: center;
            }
            
            button {
              background: none;
              border: none;
              color: white;
              opacity: 0.8;
              cursor: pointer;
              font-size: 16px;
            }
            
            button:hover {
              opacity: 1;
            }
            
            #videoContainer {
              width: 100%;
              height: 100%;
              display: none;
            }
            
            #screenVideo {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <span>${title || 'Ekran Paylaşımı'}</span>
            <button id="closeBtn" onclick="window.close()">✕</button>
          </div>
          
          <div class="container">
            <div id="messageContainer" class="message">
              Ekran paylaşımı başlamak için birkaç saniye bekleyin...<br>
              Bu pencereyi açık tutun.
            </div>
            <div id="videoContainer">
              <video id="screenVideo" autoplay playsinline></video>
            </div>
          </div>
          
          <script>
            // Electron IPC'ye erişim
            const { ipcRenderer } = require('electron');
            
            // Stream'i aktarmak için ana pencereyle iletişim kur
            ipcRenderer.on('stream-ready-for-child', (event, data) => {
              console.log('Stream verisi alındı:', data);
              
              // Message container'ı gizle, video container'ı göster
              document.getElementById('messageContainer').style.display = 'none';
              document.getElementById('videoContainer').style.display = 'block';
              
              // Ana pencereden stream URL'sini al
              if (data.streamId) {
                console.log('Stream ID alındı, video başlatılıyor');
                
                // Stream'i ana pencereden iste
                ipcRenderer.send('request-stream-data', { streamId: data.streamId });
              }
            });
            
            // Window hazır olduğunda bildir
            window.addEventListener('DOMContentLoaded', () => {
              const urlParams = new URLSearchParams(window.location.search);
              const streamId = urlParams.get('streamId');
              
              console.log('Ekran paylaşım penceresi hazır');
              
              if (streamId) {
                ipcRenderer.send('screen-window-ready', { streamId });
              }
            });
            
            // Render stream bilgisini dinle
            ipcRenderer.on('render-stream', (event, data) => {
              console.log('Stream render isteği alındı');
            });
          </script>
        </body>
        </html>
        `;
        
        // İçeriği pencereye yükle
        screenShareWindow.webContents.executeJavaScript(`
          document.body.innerHTML = \`${htmlContent.replace(/\\/g, '\\\\').replace(/`/g, '\\`')}\`;
        `);
      });
      
      // Pencere kapatıldığında null yap
      screenShareWindow.on('closed', () => {
        screenShareWindow = null;
        // Ana pencereye bildirim gönder
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('screen-share-window-closed');
        }
      });
      
      return { success: true, windowId: screenShareWindow.id };
    } catch (error) {
      console.error('Ekran paylaşımı penceresi açma hatası:', error);
      return { success: false, error: error.message };
    }
  });
  
  // Ayrı pencere IPC olayları
  ipcMain.on('screen-window-ready', (event, { streamId }) => {
    try {
      console.log('Ekran paylaşım penceresi hazır, stream ID:', streamId);
      // Pencere hazır olduğunda stream render et
      if (screenShareWindow && !screenShareWindow.isDestroyed()) {
        screenShareWindow.webContents.send('render-stream');
      }
    } catch (error) {
      console.error('Ekran paylaşım penceresi hazır olay hatası:', error);
    }
  });
  
  // Stream verisi isteğini işle
  ipcMain.on('request-stream-data', async (event, { streamId }) => {
    try {
      console.log('Screen share window requesting stream data:', streamId);
      
      // Ana pencereden stream verisini iste
      mainWindow.webContents.send('capture-screen-stream', { streamId });
    } catch (error) {
      console.error('Stream veri isteği hatası:', error);
    }
  });
  
  // Ana pencereden yavru pencereye stream aktarımı
  ipcMain.on('stream-ready-for-child', (event, data) => {
    try {
      console.log('Ana pencereden stream verisi alındı, yavru pencereye aktarılıyor', data);
      
      // Stream verisini ekran paylaşım penceresine ilet
      if (screenShareWindow && !screenShareWindow.isDestroyed()) {
        // Stream ID'si ve diğer bilgileri yolla
        screenShareWindow.webContents.send('stream-ready-for-child', data);
        
        // Remote stream olup olmadığını kontrol et ve buna göre işlem yap
        const isRemote = data.isRemote === true;
        
        if (isRemote) {
          // Uzak ekran paylaşımı için özel işlem
          console.log('Uzak stream için video capture başlatılıyor');
          
          // HTML5 video ve canvas kullanarak stream aktarımı yapabiliriz
          // Ancak şimdilik basit bir çözüm uygulamak için:
          screenShareWindow.webContents.executeJavaScript(`
            // Mesajı gizle, video konteynerini göster
            document.getElementById('messageContainer').style.display = 'none';
            document.getElementById('videoContainer').style.display = 'block';
            
            // Ekran paylaşımının aktif olduğunu belirt
            const activeText = document.createElement('div');
            activeText.style.position = 'absolute';
            activeText.style.top = '10px';
            activeText.style.left = '10px';
            activeText.style.background = 'rgba(0,0,0,0.5)';
            activeText.style.color = 'white';
            activeText.style.padding = '5px 10px';
            activeText.style.borderRadius = '4px';
            activeText.textContent = 'Ekran paylaşımı aktif - Videoyu görmek için ana pencereyi kontrol edin';
            document.querySelector('.container').appendChild(activeText);
          `);
        }
      }
    } catch (error) {
      console.error('Stream aktarımı hatası:', error);
    }
  });
  
  // Ekran paylaşımı penceresi kapatma olayı
  ipcMain.on('close-screen-share', () => {
    console.log('Ekran paylaşım penceresi kapatılıyor');
    if (screenShareWindow && !screenShareWindow.isDestroyed()) {
      screenShareWindow.close();
    }
  });
  
  // Ekran paylaşımı penceresini kapat
  ipcMain.handle('close-screen-share-window', () => {
    if (screenShareWindow && !screenShareWindow.isDestroyed()) {
      screenShareWindow.close();
      return true;
    }
    return false;
  });
  
  // MacOS 10.15 (Catalina) ve üzeri için izin kontrolü
  if (process.platform === 'darwin') {
    // macOS SystemPreferences'dan ekran kayıt ve kamera izinleri kontrolü
    const { systemPreferences } = require('electron');
    const { dialog } = require('electron');
    
    // Kamera iznini kontrol et
    if (systemPreferences && systemPreferences.getMediaAccessStatus) {
      try {
        const cameraStatus = systemPreferences.getMediaAccessStatus('camera');
        console.log('MacOS kamera erişim durumu:', cameraStatus);
        
        // Kamera izni yoksa bildirim göster
        if (cameraStatus !== 'granted') {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['Tamam'],
            title: 'Kamera İzni Gerekiyor',
            message: 'MacOS\'ta kamera kullanımı için sistem izni gerekmektedir.',
            detail: 'Bu uygulamanın kameranızı kullanabilmesi için Sistem Ayarları > Gizlilik ve Güvenlik > Kamera bölümünden bu uygulamaya izin vermeniz gerekiyor.'
          });
          
          // Kamera izni iste
          systemPreferences.askForMediaAccess('camera').then(allowed => {
            console.log('Kamera izni verildi mi:', allowed);
          });
        }
        
        // Ekran izni kontrolü
        const screenStatus = systemPreferences.getMediaAccessStatus('screen');
        console.log('MacOS ekran erişim durumu:', screenStatus);
        
        // Ekran izni yoksa bildirim göster
        if (screenStatus !== 'granted') {
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['Tamam'],
            title: 'Ekran Paylaşımı İzni Gerekiyor',
            message: 'MacOS\'ta ekran paylaşımı için sistem izni gerekmektedir.',
            detail: 'Bu uygulamanın ekran paylaşımı yapabilmesi için Sistem Ayarları > Gizlilik ve Güvenlik > Ekran Kaydı bölümünden bu uygulamaya izin vermeniz gerekiyor.'
          });
        }
      } catch (err) {
        console.error('MacOS izin kontrolü hatası:', err);
      }
    }
  }
  
  // Doğrudan main process'te desktopCapturer API'yi açığa çıkar
  // Renderer process'te erişimi etkinleştirmek için
  // ipcRenderer'i hazırla
  mainWindow.webContents.executeJavaScript(`
    if (!window.electron) window.electron = {};
    if (!window.electron.ipcRenderer) {
      try {
        const { ipcRenderer } = require('electron');
        window.electron.ipcRenderer = ipcRenderer;
        console.log('IPC Renderer başarıyla yüklendi');
      } catch (err) {
        console.error('IPC Renderer yüklenemedi:', err);
      }
    }
    
    // desktopCapturer global'a ekle
    window.electronDesktopCapturer = {
      getSources: (opts) => {
        console.log('Electron desktopCapturer.getSources çağrıldı', opts);
        return new Promise((resolve, reject) => {
          try {
            if (window.electron && window.electron.ipcRenderer) {
              window.electron.ipcRenderer.invoke('get-sources', opts)
                .then(resolve)
                .catch(reject);
            } else {
              console.error('IPC Renderer erişilebilir değil');
              reject(new Error('IPC Renderer erişilebilir değil'));
            }
          } catch (err) {
            console.error('DesktopCapturer hatası:', err);
            reject(err);
          }
        });
      }
    };
    console.log('Electron desktopCapturer API hazır');
  `);
  
  // IPC handler
  ipcMain.handle('get-sources', async (event, opts) => {
    try {
      console.log('Main process: desktopCapturer.getSources çağrıldı', opts);
      
      // Tam gizlilik uyarısı olarak diyalog göster
      const { dialog } = require('electron');
      const { response } = await dialog.showMessageBox(mainWindow, {
        type: 'info',
        buttons: ['Ekranı Paylaş', 'İptal'],
        defaultId: 0,
        title: 'Ekran Paylaşımı',
        message: 'Ekran paylaşımı yapmak istiyor musunuz?',
        detail: 'MacOS\'ta ekran paylaşımı için sistem izni gerekmektedir. Eğer paylaşım yapamıyorsanız, \'Sistem Ayarları > Gizlilik ve Güvenlik > Gizlilik > Ekran Kaydı\' bölümünden bu uygulamaya izin vermeniz gerekebilir.'
      });
      
      // Kullanıcı paylaşım yapmayı reddetti
      if (response === 1) {
        console.log('Kullanıcı ekran paylaşımını reddetti');
        return [];
      }
      
      // Ekran kaynaklarını al
      const sources = await desktopCapturer.getSources(opts);
      console.log('Main process: Kullanılabilir kaynaklar:', sources.length);
      return sources;
    } catch (error) {
      console.error('Main process: Ekran kaynakları alınamadı:', error);
      return [];
    }
  });

  // Geliştirme modunda mı kontrol et
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    // Vite geliştirme sunucusundan yükle
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // Üretim yapısından yükle
    mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  
  // MacOS için dock ikonu tekrar ayarla (bazı sistemlerde uygulama hazır olduğunda daha güvenli)
  if (process.platform === 'darwin') {
    try {
      // Disk üzerinde hazır ikon oluştur
      const fs = require('fs');
      const iconData = Buffer.from(`
        <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
          <rect width="256" height="256" fill="#000000" rx="40" ry="40"/>
          <text x="128" y="128" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="160" fill="white">T</text>
        </svg>
      `);
      
      const tempIconPath = path.join(app.getPath('temp'), 'treffy-icon.svg');
      fs.writeFileSync(tempIconPath, iconData);
      
      const icon = nativeImage.createFromPath(tempIconPath);
      if (!icon.isEmpty()) {
        app.dock.setIcon(icon);
        console.log('Dock ikonu başarıyla oluşturuldu ve ayarlandı');
      }
    } catch (err) {
      console.error('Dock icon yüklenemedi (whenReady):', err);
    }
  }
  
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
