// Ekran paylaşımını başlat - MacOS Electron için özel sürüm
export async function startScreenShare() {
  console.log('MacOS için özelleştirilmiş ekran paylaşımı başlatılıyor...');
  
  try {
    // Electron desktopCapturer erişimini kontrol et
    const isNodeIntegrationEnabled = typeof process !== 'undefined' && process.versions && process.versions.electron;
    console.log('Node entegrasyonu etkin:', !!isNodeIntegrationEnabled);
    
    // Electron için desktopCapturer kontrolü
    if (window.electronDesktopCapturer || (isNodeIntegrationEnabled && window.require)) {
      try {
        console.log('Electron desktopCapturer ile ekran paylaşımı deneniyor...');
        
        // Önce window.electronDesktopCapturer'ı dene (main.js'den enjekte edilmiş)
        let sources = [];
        if (window.electronDesktopCapturer) {
          console.log('window.electronDesktopCapturer kullanılıyor');
          
          // Kullanıcıya MacOS için bilgilendirme göster
          window.alert(
            "MacOS'ta ekran paylaşımı için gerekli izinlere ihtiyaç var. Eğer paylaşım çalışmazsa, 'Sistem Ayarları > Gizlilik ve Güvenlik > Gizlilik > Ekran Kaydı' bölümünden bu uygulamaya izin vermeniz gerekebilir."
          );
          
          sources = await window.electronDesktopCapturer.getSources({ 
            types: ['screen', 'window'],
            thumbnailSize: { width: 100, height: 100 }
          });
        } else {
          // Alternatif yöntem - doğrudan require
          console.log('require("electron").desktopCapturer kullanılıyor');
          const { desktopCapturer } = window.require('electron');
          sources = await desktopCapturer.getSources({ 
            types: ['screen', 'window'],
            thumbnailSize: { width: 0, height: 0 }
          });
        }
        
        console.log('Kullanılabilir kaynaklar:', sources.length);
        
        if (sources.length > 0) {
          // İlk kaynağı kullan (tam ekran)
          const source = sources[0];
          console.log('Seçilen kaynak:', source.id);
          
          // MacOS Electron için stream constraints
          const constraints = {
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
              }
            }
          };
          
          // Akışı al
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log('Akış başarıyla oluşturuldu:', stream.id);
          return stream;
        } else {
          throw new Error('Ekran kaynağı bulunamadı');
        }
      } catch (electronError) {
        console.error('Electron ekran paylaşımı başarısız:', electronError);
        // Electron başarısız olursa standard metoda devam et
      }
    }
    
    // Standart tarayıcı yaklaşımı
    console.log('Standart getDisplayMedia API deneniyor...');
    try {
      // En basit konfigürasyonu dene - genellikle en iyi şekilde çalışır
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      
      console.log('Ekran paylaşımı başarılı!', stream.id);
      console.log('Video izleri:', stream.getVideoTracks().length);
      
      return stream;
    } catch (browserError) {
      console.error('Tarayıcı ekran paylaşımı başarısız:', browserError);
      throw browserError;
    }
  } catch (error) {
    console.error('Ekran paylaşımı başlatılamadı:', error);
    
    // Özel hata mesajları
    if (error.name === 'NotAllowedError') {
      throw new Error('Ekran paylaşımı izni reddedildi. Lütfen izin verin ve tekrar deneyin.');
    } else if (error.name === 'NotSupportedError' || error.message.includes('not supported')) {
      throw new Error('Tarayıcınız ekran paylaşımını desteklemiyor. Lütfen Chrome veya Edge kullanın veya System Preferences > Security & Privacy > Privacy > Screen Recording\'den izin verin.');
    } else if (error.name === 'NotFoundError') {
      throw new Error('Paylaşılacak ekran bulunamadı.');
    } else {
      throw new Error(`Ekran paylaşımı başlatılamadı: ${error.message}`);
    }
  }
}

// Ekran paylaşımını sonlandır
export function stopScreenShare(stream) {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

// Akışları birleştir (ses + ekran)
export function combineStreams(screenStream, audioStream) {
  if (!screenStream) return null;
  
  const combinedStream = new MediaStream();
  
  // Ekran video akışını ekle
  screenStream.getVideoTracks().forEach(track => {
    combinedStream.addTrack(track);
  });
  
  // Ses akışını ekle (eğer ekran paylaşımı kendi sesiyle gelmiyorsa)
  if (audioStream && screenStream.getAudioTracks().length === 0) {
    audioStream.getAudioTracks().forEach(track => {
      combinedStream.addTrack(track);
    });
  }
  
  return combinedStream;
}
