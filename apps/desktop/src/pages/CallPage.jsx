import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import VideoRenderer from '../components/VideoRenderer';
import { 
  getUserMedia, 
  stopMediaStream, 
  toggleAudio, 
  toggleVideo,
  createPeerConnection,
  createOffer,
  createAnswer,
  setRemoteDescription,
  addIceCandidate
} from '../utils/webrtc';
import { startScreenShare, stopScreenShare, combineStreams } from '../utils/screen-share';
import { setVideoQuality, videoQualities } from '../utils/video-quality';
import { createSignalingClient } from '../utils/signaling';
import { buttonStyle, colors, cardStyle, badgeStyle } from '../styles';

// UI İçin Simgeler (SVG)
const MicIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const MicOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"></line>
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
    <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const VideoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"></polygon>
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
  </svg>
);

const VideoOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34l1 1L23 7v10"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const ScreenShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>
);

const StopScreenShareIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M13 3H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3"></path>
    <polyline points="8 21 12 17 16 21"></polyline>
    <path d="M19 12v-2l-4 -4v3h-7"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

const PhoneOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"></path>
    <line x1="23" y1="1" x2="1" y2="23"></line>
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

function CallPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [copySuccess, setCopySuccess] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('hd');
  const [isRemoteScreenShare, setIsRemoteScreenShare] = useState(false);
  
  const peerConnectionRef = useRef(null);
  const signalingRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteStreamRef = useRef(new MediaStream());
  const userId = useRef(`user-${Math.random().toString(36).substring(2, 7)}`).current;
  
  // Debug yardımcısı
  const debug = (message, data) => {
    console.log(`[DEBUG] ${message}`, data || '');
  };
  
  // Video kalitesini ayarla
  const changeVideoQuality = async (quality) => {
    if (!localStream) return;
    
    try {
      const newStream = await setVideoQuality(localStream, quality);
      setLocalStream(newStream);
      setSelectedQuality(quality);
      
      // Bağlantıdaki video track'i güncelle
      if (peerConnectionRef.current) {
        const videoTrack = newStream.getVideoTracks()[0];
        if (videoTrack) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender) {
            videoSender.replaceTrack(videoTrack);
          }
        }
      }
    } catch (error) {
      debug('Video kalitesi değiştirilemedi:', error.message);
    }
  };
  
  // Electron IPC'ye erişim
  const getElectronIpc = () => {
    if (window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        return ipcRenderer;
      } catch (error) {
        debug('Electron IPC erişimi hatası:', error.message);
      }
    }
    return null;
  };
  
  // Ana pencerede çalışacak stream iletişim işleyicileri
  useEffect(() => {
    // IPC bağlantısı
    const ipcRenderer = getElectronIpc();
    if (!ipcRenderer) return;
    
    // Ekran paylaşımı penceresi stream istediğinde
    const captureHandler = (event, { streamId }) => {
      debug('Ekran stream yakalama isteği alındı, streamId:', streamId);
      
      // Stream'i bul
      if (screenStream && screenStream.id === streamId) {
        debug('Stream bulundu, video eklemek için hazırlanıyor');
        
        try {
          // Ekran paylaşım içeriğini ayrı pencereye aktar
          // Bu karmaşık bir işlem, temelde ekran görüntüsünün anlık olarak yakalanması gerekiyor
          // WebRTC MediaStream nesneleri pencereler arası paylaşılamadığı için
          
          // URL oluştur ve karşı pencereye gönder
          const track = screenStream.getVideoTracks()[0];
          if (track) {
            // Track aktif mi kontrol et
            debug('Track aktif mi:', track.enabled);
            
            // Diğer pencereye stream-data mesajını yolla (URL tabanlı paylaşım için)
            ipcRenderer.send('stream-ready-for-child', { 
              streamId,
              trackEnabled: track.enabled,
              trackKind: track.kind
            });
          } else {
            debug('Stream içinde video track bulunamadı');
          }
        } catch (error) {
          debug('Stream yakalama hatası:', error.message);
        }
      } else {
        debug('İstenen stream bulunamadı:', streamId);
      }
    };
    
    // Ana pencereden alt pencereye içerik aktarımı
    ipcRenderer.on('capture-screen-stream', captureHandler);
    
    // Ekran paylaşımı penceresi kapatıldı olayını dinle
    const closedHandler = () => {
      debug('Ekran paylaşımı penceresi kapatıldı');
      // Eğer uzak ekran paylaşımı ise, stream video track'ini güncelle
      if (isRemoteScreenShare) {
        debug('Uzak ekran paylaşımı penceresi kapatıldı, isRemoteScreenShare sıfırlanıyor');
        setIsRemoteScreenShare(false);
      }
    };
    
    ipcRenderer.on('screen-share-window-closed', closedHandler);
    
    // Temizlik işlevi
    return () => {
      ipcRenderer.removeListener('capture-screen-stream', captureHandler);
      ipcRenderer.removeListener('screen-share-window-closed', closedHandler);
    };
  }, [screenStream, isRemoteScreenShare]);
  
  // Uzak ekran paylaşımı değişikliklerini izle ve ayrı pencere aç
  useEffect(() => {
    if (!remoteStream) return;
    
    debug('Remote stream değişti, ekran paylaşımı kontrolü yapılıyor');
    
    // Uzak stream'de video track var mı kontrol et
    const videoTracks = remoteStream.getVideoTracks();
    if (videoTracks.length > 0) {
      // Video track bilgilerini kontrol et
      const videoTrack = videoTracks[0];
      debug('Uzak video track bulundu:', videoTrack.label);
      
      // Track özelliklerini kontrol ederek ekran paylaşımı olup olmadığını anla
      const isScreenShare = videoTrack.label.toLowerCase().includes('screen') || 
                            videoTrack.label.toLowerCase().includes('display') ||
                            videoTrack.label.toLowerCase().includes('window');
                            
      // isRemoteScreenShare state'ini güncelle
      setIsRemoteScreenShare(isScreenShare);
      
      // Eğer track değişmişse ve ekran paylaşımı olduğu anlaşılırsa
      if (isScreenShare) {
        debug('Uzak ekran paylaşımı algılandı, yeni pencere açılacak');
        
        // Ekran paylaşımı için yeni pencere aç
        const ipcRenderer = getElectronIpc();
        if (ipcRenderer) {
          ipcRenderer.invoke('open-screen-share-window', {
            streamId: remoteStream.id,
            title: 'Ekran Paylaşımı - Uzak Kullanıcı'
          }).then(result => {
            debug('Uzak ekran paylaşımı penceresi açıldı:', result.success);
            
            // Ayrı pencereye stream'i gönder
            if (result.success) {
              // Stream'i karşı pencereye göndermeye hazırlan
              debug('Stream ayrı pencereye gönderiliyor');
              
              // Ana pencereden karşı pencereye stream bilgilerini ilet
              setTimeout(() => {
                ipcRenderer.send('stream-ready-for-child', {
                  streamId: remoteStream.id,
                  trackEnabled: videoTrack.enabled,
                  trackKind: videoTrack.kind,
                  isRemote: true
                });
              }, 500);
            }
          }).catch(error => {
            debug('Uzak ekran paylaşımı penceresi açılamadı:', error.message);
          });
        }
      }
    }
  }, [remoteStream]);
  
  // Ana pencere için video konteyner güncelleme
  useEffect(() => {
    if (!remoteStream) {
      setIsRemoteScreenShare(false);
      return;
    }
    
    // Video track'i kontrol et
    const videoTracks = remoteStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const videoTrack = videoTracks[0];
      
      // Ekran paylaşımı olup olmadığını anla
      const isScreen = videoTrack.label.toLowerCase().includes('screen') || 
                        videoTrack.label.toLowerCase().includes('display') ||
                        videoTrack.label.toLowerCase().includes('window');
      
      setIsRemoteScreenShare(isScreen);
      debug('Uzak stream tipi güncellendi:', isScreen ? 'ekran paylaşımı' : 'kamera');
      
      // Eğer ekran paylaşımı ise ve yeni algılanıyorsa, artık ana pencere sadece kamera gösterecek
      if (isScreen) {
        debug('Ekran paylaşımı algılandı - ana pencerede kamera görüntüsüne odaklanılacak');
      }
    } else {
      setIsRemoteScreenShare(false);
    }
  }, [remoteStream]);
  
  // Elektron içinde yeni pencere aç
  const openScreenShareWindow = async (stream, title) => {
    try {
      const ipcRenderer = getElectronIpc();
      if (!ipcRenderer) {
        debug('Electron IPC bulunamadı, ayrı pencere açılamıyor');
        return false;
      }
      
      // Stream ID'sini kaydet
      const streamId = stream.id;
      debug('Ekran paylaşımı için yeni pencere açılıyor, stream ID:', streamId);
      
      // Yeni pencere oluştur
      const result = await ipcRenderer.invoke('open-screen-share-window', { 
        streamId, 
        title: title || 'Ekran Paylaşımı'
      });
      
      debug('Ekran paylaşımı pencere sonucu:', result);
      
      if (result.success) {
        // Pencere kapatıldığında olayı dinle
        ipcRenderer.on('screen-share-window-closed', () => {
          debug('Ekran paylaşımı penceresi kapatıldı');
          // Ekran paylaşımını durdur
          if (isScreenSharing && screenStream) {
            stopScreenShare(screenStream);
            setScreenStream(null);
            setIsScreenSharing(false);
          }
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      debug('Ekran paylaşımı penceresi açma hatası:', error.message);
      return false;
    }
  };
  
  // Ekran paylaşımını aç/kapat
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Ekran paylaşımını durdur
      if (screenStream) {
        stopScreenShare(screenStream);
        setScreenStream(null);
      }
      
      // Kamera videosuna geri dön
      if (peerConnectionRef.current && localStream) {
        const senders = peerConnectionRef.current.getSenders();
        const videoSender = senders.find(sender => 
          sender.track && sender.track.kind === 'video'
        );
        
        if (videoSender && localStream.getVideoTracks()[0]) {
          videoSender.replaceTrack(localStream.getVideoTracks()[0]);
        }
      }
      
      // Ekran paylaşımı penceresini kapat (eğer açıksa)
      const ipcRenderer = getElectronIpc();
      if (ipcRenderer) {
        await ipcRenderer.invoke('close-screen-share-window');
      }
      
      setIsScreenSharing(false);
    } else {
      // Ekran paylaşımını başlat
      try {
        // MacOS'ta izin uyarısı
        const isMac = navigator.platform && navigator.platform.indexOf('Mac') !== -1;
        if (isMac) {
          const userConfirmed = window.confirm(
            "MacOS ekran paylaşımı izni gerekiyor. Devam etmek istiyor musunuz?\n\n" +
            "Not: Bu özelliği kullanmak için, 'Sistem Tercihleri > Güvenlik ve Gizlilik > Gizlilik > Ekran Kaydı' bölümünden uygulamaya izin vermeniz gerekebilir."
          );
          
          if (!userConfirmed) {
            throw new Error('Kullanıcı ekran paylaşım diyaloğunu reddetti');
          }
        }
        
        debug('Ekran paylaşımı başlatılıyor...');
        const stream = await startScreenShare();
        debug('Ekran paylaşımı başarılı, stream ID:', stream.id);
        
        // Stream'i kaydet
        setScreenStream(stream);
        
        // Peer bağlantısındaki video track'i güncelle
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(sender => 
            sender.track && sender.track.kind === 'video'
          );
          
          if (videoSender && stream.getVideoTracks()[0]) {
            videoSender.replaceTrack(stream.getVideoTracks()[0]);
          }
        }
        
        // Track bitimini dinle (kullanıcı paylaşımı durdurduğunda)
        stream.getVideoTracks()[0].onended = () => {
          debug('Kullanıcı ekran paylaşımını durdurdu');
          setIsScreenSharing(false);
          setScreenStream(null);
          
          // Kamera videosuna geri dön
          if (peerConnectionRef.current && localStream) {
            const senders = peerConnectionRef.current.getSenders();
            const videoSender = senders.find(sender => 
              sender.track && sender.track.kind === 'video'
            );
            
            if (videoSender && localStream.getVideoTracks()[0]) {
              videoSender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          }
          
          // Ekran paylaşımı penceresini kapat (eğer açıksa)
          const ipcRenderer = getElectronIpc();
          if (ipcRenderer) {
            ipcRenderer.invoke('close-screen-share-window');
          }
        };
        
        // Ayrı pencere aç
        const windowOpened = await openScreenShareWindow(stream, "Ekran Paylaşımı - " + userId);
        debug('Ekran paylaşımı penceresi açıldı mı?', windowOpened);
        
        setIsScreenSharing(true);
      } catch (error) {
        debug('Ekran paylaşımı başlatma hatası:', error.message);
        setError('Ekran paylaşımı başlatılamadı: ' + error.message);
      }
    }
  };
  
  // Basitleştirilmiş odaya katılma mantığı
  const joinRoom = async () => {
    try {
      debug('Odaya katılınıyor:', roomId);
      
      // Medya akışını al
      const stream = await getUserMedia();
      debug('Medya akışı alındı:', stream.id);
      debug('Track sayısı:', stream.getTracks().length);
      debug('Tracks:', stream.getTracks().map(t => t.kind));
      
      // Seçilen kaliteye ayarla
      await setVideoQuality(stream, selectedQuality);
      setLocalStream(stream);
      
      // Peer bağlantısı oluştur
      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;
      
      // Uzak stream referansını boş olarak başlat
      const newRemoteStream = new MediaStream();
      remoteStreamRef.current = newRemoteStream;
      
      // Yerel stream'i ekle
      stream.getTracks().forEach(track => {
        debug('Yerel track ekleniyor');
        peerConnection.addTrack(track, stream);
      });
      
      // Bağlantı olay işleyicilerini ayarlayan yardımcı fonksiyon tanımı (erken tanımla)
      const setupPeerConnectionListeners = (pc) => {
        // Uzak track'leri işle 
        pc.ontrack = (event) => {
          debug('Uzak track alındı, stream sayısı:', event.streams.length);
          if (event.streams && event.streams.length > 0) {
            debug('Stream ID:', event.streams[0].id);
            debug('Track sayısı:', event.streams[0].getTracks().length);
            debug('Track türleri:', event.streams[0].getTracks().map(t => t.kind).join(', '));
            
            // Stream'i yeni bir değişkene atayıp işle
            const stream = event.streams[0];
            
            // Stream'i state ve ref'e kaydet
            remoteStreamRef.current = stream;
            
            // ÇÖZÜM: setTimeout ile state güncelleme
            setTimeout(() => {
              debug('Remote stream state\'e ayarlanıyor:', stream.id);
              setRemoteStream(stream);
            }, 100);
            
            // Ayrıca UI yenilemeleri için connectionStatus'u update et
            setConnectionStatus('connected');
          } else {
            debug('Uzak stream bulunamadı');
          }
        };
        
        // ICE adaylarını dinle
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            debug('ICE adayı oluşturuldu');
            sendToPeer({
              type: 'ice-candidate',
              payload: event.candidate
            });
          }
        };
        
        // ICE bağlantı durumunu izle
        pc.oniceconnectionstatechange = () => {
          debug('ICE bağlantı durumu değişti:', pc.iceConnectionState);
          
          if (pc.iceConnectionState === 'connected' || 
              pc.iceConnectionState === 'completed') {
            setConnectionStatus('connected');
          } else if (pc.iceConnectionState === 'failed') {
            debug('ICE bağlantısı başarısız oldu');
            handleIceFailure(pc);
          } else if (pc.iceConnectionState === 'disconnected' ||
                    pc.iceConnectionState === 'closed') {
            setConnectionStatus('disconnected');
          }
        };
      };
      
      // Olay işleyicilerini ayarla
      setupPeerConnectionListeners(peerConnection);
      
      // Bağlantı için otomatik yeniden bağlantı işleyicisi
      const handleIceFailure = (pc) => {
        debug('ICE bağlantısı başarısız oldu, yeniden deneniyor...');
          
        // Yeniden bağlantı dene
        setTimeout(async () => {
          try {
            // Şimdiki bağlantıyı kapat
            pc.close();
            
            // Yeni bağlantı oluştur
            const newPeerConnection = createPeerConnection();
            peerConnectionRef.current = newPeerConnection;
            
            // Yerel stream'i ekle
            if (localStream) {
              localStream.getTracks().forEach(track => {
                newPeerConnection.addTrack(track, localStream);
              });
            }
            
            // Olay işleyicilerini tekrar ekle
            setupPeerConnectionListeners(newPeerConnection);
            
            // Yeni teklif oluştur
            const offer = await createOffer(newPeerConnection);
            sendToPeer({
              type: 'offer',
              payload: offer
            });
            
            debug('Bağlantı yeniden kuruldu ve teklif gönderildi');
          } catch (error) {
            debug('Bağlantı yeniden kurma hatası:', error.message);
            setConnectionStatus('disconnected');
          }
        }, 1000);
      };
      
      // Sinyal sunucusuna bağlan - HTTP kullanarak
      const signalingClient = createSignalingClient('http://5.133.102.214:3001');
      signalingRef.current = signalingClient;
      
      // Aktif ICE durumlarını günlükle
      window.setInterval(() => {
        const pc = peerConnectionRef.current;
        if (pc) {
          debug('ICE durumu:', pc.iceConnectionState);
          debug('Bağlantı durumu:', pc.connectionState);
          debug('Sinyal durumu:', pc.signalingState);
          
          // Uzak stream kontrol et
          if (remoteStream) {
            debug('Uzak stream var:', remoteStream.id); 
            debug('Uzak stream track sayısı:', remoteStream.getTracks().length);
            debug('Uzak stream track türleri:', remoteStream.getTracks().map(t => t.kind).join(', '));
          } else {
            debug('Uzak stream henüz yok');
          }
        }
      }, 5000);
      
      signalingClient.onSignalingMessage(async (message) => {
        try {
          debug('Sinyal mesajı alındı:', JSON.stringify(message));
          
          switch (message.type) {
            case 'offer':
              await handleOffer(message.payload);
              break;
            case 'answer':
              await handleAnswer(message.payload);
              break;
            case 'ice-candidate':
              await handleIceCandidate(message.payload);
              break;
            case 'user-joined':
              handleUserJoined(message.payload);
              break;
            case 'user-left':
              handleUserLeft(message.payload);
              break;
          }
        } catch (error) {
          debug('Sinyal mesajı işleme hatası:', error.message);
        }
      });
      
      signalingClient.onConnect(() => {
        debug('Sinyal sunucusuna bağlandı');
        signalingClient.joinRoom(roomId, userId);
        
        // Odada başka kullanıcı var mı diye birkaç saniye bekle, 
        // yoksa sen teklif gönder
        setTimeout(async () => {
          const pc = peerConnectionRef.current;
          if (pc && pc.connectionState !== 'connected') {
            try {
              debug('Teklif oluşturuluyor...');
              const offer = await createOffer(pc);
              debug('Teklif oluşturuldu');
              sendToPeer({
                type: 'offer',
                payload: offer
              });
            } catch (error) {
              debug('Teklif oluşturma hatası:', error.message);
            }
          }
        }, 1000);
      });
      
      signalingClient.connect(userId);
      
    } catch (error) {
      debug('Odaya katılma hatası:', error.message);
      setError('Görüşme başlatılamadı: ' + error.message);
      setConnectionStatus('error');
    }
  };
  
  // PEER İLETİŞİM FONKSİYONLARI 
  
  // Sinyal mesajı gönder
  const sendToPeer = (data) => {
    if (signalingRef.current) {
      // Mesajı göndermeden önce konsola kaydet
      const message = {
        ...data,
        from: userId,
        to: roomId
      };
      console.log('Gönderilen mesaj:', message);
      signalingRef.current.sendMessage(message);
    }
  };
  
  // Teklif işle
  const handleOffer = async (offer) => {
    debug('Teklif işleniyor');
    const pc = peerConnectionRef.current;
    
    if (pc) {
      try {
        // Şu anki durum kontrolü
        if (pc.signalingState === 'have-local-offer') {
          debug('Zaten yerel teklif var, teklif çakışması olabilir');
          // Teklif çakışması - görüşme ID'leri karşılaştır, küçük olan kazanır
          const localId = userId;
          const remoteId = offer.from || '';
          
          if (localId < remoteId) {
            debug('Yerel ID daha küçük, teklifimizde ısrar ediyoruz');
            return; // Uzak teklifi yoksay
          } else {
            debug('Uzak ID daha küçük, tekliflerini kabul ediyoruz');
            // Mevcut bağlantıyı kapat ve yenisini oluştur
            pc.close();
            const newPC = createPeerConnection();
            peerConnectionRef.current = newPC;
            
            // Yerel stream'i ekle
            if (localStream) {
              localStream.getTracks().forEach(track => {
                newPC.addTrack(track, localStream);
              });
            }
            
            // Dinleyicileri ayarla
            setupPeerConnectionListeners(newPC);
            
            // Uzak tanımı ayarla
            await setRemoteDescription(newPC, offer);
            
            // Cevap oluştur
            const answer = await createAnswer(newPC);
            
            sendToPeer({
              type: 'answer',
              payload: answer
            });
            
            return;
          }
        }
        
        // Normal işleme
        await setRemoteDescription(pc, offer);
        debug('Uzak teklif başarıyla ayarlandı');
        debug('Cevap oluşturuluyor');
        const answer = await createAnswer(pc);
        debug('Cevap oluşturuldu');
        
        sendToPeer({
          type: 'answer',
          payload: answer
        });
      } catch (error) {
        debug('Teklif işleme hatası:', error.message);
        
        // Sinyal durumu hatası varsa, bağlantıyı sıfırla
        if (error.message.includes('INVALID_STATE') || 
            error.message.includes('wrong state')) {
          
          debug('Sinyal durumu hatası, bağlantı sıfırlanıyor...');
          
          // Mevcut bağlantıyı kapat
          pc.close();
          
          // Yeni bağlantı oluştur
          const newPC = createPeerConnection();
          peerConnectionRef.current = newPC;
          
          // Yerel stream'i ekle
          if (localStream) {
            localStream.getTracks().forEach(track => {
              newPC.addTrack(track, localStream);
            });
          }
          
          // Dinleyicileri ayarla
          setupPeerConnectionListeners(newPC);
          
          // Teklifle devam et
          await setRemoteDescription(newPC, offer);
          const answer = await createAnswer(newPC);
          
          sendToPeer({
            type: 'answer',
            payload: answer
          });
        }
      }
    }
  };
  
  // Cevap işle
  const handleAnswer = async (answer) => {
    debug('Cevap işleniyor');
    const pc = peerConnectionRef.current;
    
    if (pc) {
      try {
        // Durumu kontrol et
        if (pc.signalingState !== 'have-local-offer') {
          debug('Beklenmeyen durum, yerel teklif olmadan cevap alındı. Durum:', pc.signalingState);
          return;
        }
        
        await setRemoteDescription(pc, answer);
        debug('Uzak tanımlama başarıyla ayarlandı');
      } catch (error) {
        debug('Uzak tanımlama ayarlama hatası:', error.message);
        
        // Sinyal durumu hatası çözümü
        if (error.message.includes('INVALID_STATE') || 
            error.message.includes('wrong state')) {
          
          debug('Sinyal durumu hatası, yeni görüşme başlatılacak...');
          
          // Bağlantıyı temizle
          setTimeout(async () => {
            try {
              // Tüm bağlantıları kapat
              if (pc.signalingState !== 'closed') {
                pc.close();
              }
              
              // Yeni bağlantı oluştur
              const newPC = createPeerConnection();
              peerConnectionRef.current = newPC;
              
              // Yerel stream'i ekle
              if (localStream) {
                localStream.getTracks().forEach(track => {
                  newPC.addTrack(track, localStream);
                });
              }
              
              // Dinleyicileri ayarla
              setupPeerConnectionListeners(newPC);
              
              // Yeni teklif gönder
              const offer = await createOffer(newPC);
              sendToPeer({
                type: 'offer',
                payload: offer
              });
              
              debug('Yeni bağlantı kuruldu ve teklif gönderildi');
            } catch (retryError) {
              debug('Bağlantı yenileme hatası:', retryError.message);
            }
          }, 1000);
        }
      }
    }
  };
  
  // ICE adayı işle
  const handleIceCandidate = async (candidate) => {
    const pc = peerConnectionRef.current;
    
    if (pc) {
      try {
        await addIceCandidate(pc, candidate);
      } catch (error) {
        debug('ICE aday işleme hatası:', error.message);
      }
    }
  };
  
  // Kullanıcı katıldı
  const handleUserJoined = (data) => {
    debug('Kullanıcı katıldı:', data.userId);
    
    // Gelen kullanıcıya anında teklif gönder
    setTimeout(async () => {
      const pc = peerConnectionRef.current;
      if (pc && pc.connectionState !== 'connected') {
        try {
          debug('Kullanıcı katıldı, hemen teklif oluşturuluyor...');
          const offer = await createOffer(pc);
          debug('Yeni kullanıcı için teklif oluşturuldu');
          sendToPeer({
            type: 'offer',
            payload: offer
          });
        } catch (error) {
          debug('Teklif oluşturma hatası:', error.message);
        }
      }
    }, 500);
  };
  
  // Kullanıcı ayrıldı
  const handleUserLeft = (data) => {
    debug('Kullanıcı ayrıldı:', data.userId);
    setRemoteStream(null);
    setConnectionStatus('disconnected');
  };
  
  // Sayfa yüklendiğinde
  // RemoteStream değişikliklerini izlemek için ayrı bir effect
  useEffect(() => {
    if (remoteStream) {
      debug('Remote stream atandı ve useEffect tetiklendi:', remoteStream.id);
      debug('Track sayısı:', remoteStream.getTracks().length);
      debug('Track türleri:', remoteStream.getTracks().map(t => t.kind).join(', '));
      
      // RemoteStream değiştiğinde bunu remoteVideoRef'e doğrudan da atayalım
      if (remoteVideoRef.current) {
        debug('RemoteStream remote video ref\'e doğrudan atanıyor');
        // Video elementi doğrudan DOM'dan alınıp müdahale ediliyor
        const videoEl = document.querySelector('[data-remote="true"]');
        if (videoEl && videoEl.srcObject !== remoteStream) {
          debug('RemoteStream video elementine manuel atanıyor');
          videoEl.srcObject = remoteStream;
          videoEl.play().catch(e => debug('Video oynatma hatası:', e));
        }
      }
    }
  }, [remoteStream]);

  // Ana başlatma effect'i
  useEffect(() => {
    debug('Ana useEffect çalıştı, oda bilgisi:', roomId);
    joinRoom();
    
    return () => {
      // Temizleme işlemi
      debug('Bileşen temizleniyor');
      
      if (signalingRef.current) {
        signalingRef.current.leaveRoom(roomId, userId);
        signalingRef.current.disconnect();
      }
      
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      
      if (localStream) {
        stopMediaStream(localStream);
      }
      
      if (screenStream) {
        stopScreenShare(screenStream);
      }
    };
  }, [roomId, userId]);
  
  const handleToggleMute = () => {
    if (localStream) {
      const success = toggleAudio(localStream, isMuted);
      if (success) {
        setIsMuted(!isMuted);
      }
    }
  };
  
  const handleToggleCamera = () => {
    if (localStream) {
      const success = toggleVideo(localStream, isCameraOff);
      if (success) {
        setIsCameraOff(!isCameraOff);
      }
    }
  };
  
  const handleEndCall = () => {
    navigate('/');
  };
  
  const copyRoomId = (e) => {
    // Prevent event bubbling and stop dragging behavior
    if (e) e.stopPropagation();
    
    try {
      navigator.clipboard.writeText(roomId);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Kopyalama hatası:", err);
      // Fallback metodu
      const textarea = document.createElement('textarea');
      textarea.value = roomId;
      textarea.style.position = 'fixed';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      try {
        document.execCommand('copy');
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (e) {
        console.error('Fallback kopyalama hatası:', e);
      }
      
      document.body.removeChild(textarea);
    }
  };
  
  // Ayarlar menüsü
  const renderSettings = () => {
    if (!showSettings) return null;
    
    return (
      <div style={{
        position: 'absolute',
        right: '20px',
        bottom: '80px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(8px)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        padding: '16px',
        width: '300px',
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        pointerEvents: 'auto',
        '-webkit-app-region': 'no-drag'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{ 
            margin: 0,
            color: 'white',
            fontSize: '16px'
          }}>
            Video Kalitesi
          </h3>
          
          <button 
            onClick={() => setShowSettings(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              '-webkit-app-region': 'no-drag'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          {Object.keys(videoQualities).map((quality) => (
            <button 
              key={quality}
              style={{
                flex: 1,
                background: selectedQuality === quality ? 
                  'rgba(79, 70, 229, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${selectedQuality === quality ? 
                  'rgba(79, 70, 229, 0.5)' : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                padding: '12px 8px',
                cursor: 'pointer',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: selectedQuality === quality ? 
                  '0 0 10px rgba(79, 70, 229, 0.3)' : 'none',
                '-webkit-app-region': 'no-drag'
              }}
              onClick={() => {
                changeVideoQuality(quality);
                setShowSettings(false);
              }}
            >
              <span style={{ 
                fontSize: '14px', 
                fontWeight: 'bold',
                marginBottom: '2px'
              }}>
                {videoQualities[quality].label}
              </span>
              <span style={{ 
                fontSize: '11px',
                opacity: 0.7
              }}>
                {videoQualities[quality].description}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div 
      onMouseDown={(e) => {
        // Only allow dragging when clicking directly on this div background
        if (e.target === e.currentTarget) {
          // The event is already handled by webkit-app-region: drag
          // No additional action needed
        }
      }}
      style={{ 
        height: '100vh',
        backgroundColor: 'black',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        position: 'relative',
        '-webkit-app-region': 'drag' // Tüm pencereyi sürüklenebilir yap
      }}>
      
      {/* Ana video alanı - sadece video içeren kısım */}
      <div style={{ 
        flex: 1,
        position: 'relative',
        backgroundColor: 'black',
        overflow: 'hidden'
      }}>
        {remoteStream && !isRemoteScreenShare ? (
          // Uzak kamera
          <div key="remote-video" style={{ width: '100%', height: '100%' }}>
            <VideoRenderer 
              key={`remote-${remoteStream.id}`}
              stream={remoteStream}
              showQuality={true}
              ref={remoteVideoRef}
              isRemote={true}
            />
          </div>
        ) : remoteStream && isRemoteScreenShare ? (
          // Ekran paylaşımı varsa uzak kullanıcının kamerası gösterilmez
          <div key="remote-screen-notice" style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            backgroundColor: '#111'
          }}>
            <div style={{ 
              fontSize: '16px', 
              marginBottom: '16px',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '16px 24px',
              borderRadius: '8px',
              textAlign: 'center' 
            }}>
              <p style={{ marginBottom: '12px' }}>
                <b>Ekran paylaşımı çalışıyor</b>
              </p>
              <p>
                Ekran paylaşımı ayrı bir pencerede görüntüleniyor.<br />
                Ayrı pencereyi kontrol edin.
              </p>
            </div>
            
            {/* Yerel kamerayı küçük pencere olarak göster */}
            {localStream && (
              <div style={{ 
                width: '320px', 
                height: '240px', 
                borderRadius: '8px', 
                overflow: 'hidden',
                border: '2px solid rgba(255,255,255,0.3)',
                marginTop: '16px'
              }}>
                <VideoRenderer 
                  key={`local-small-${localStream.id}`}
                  stream={localStream}
                  muted
                  mirror={true}
                  isRemote={false}
                />
              </div>
            )}
          </div>
        ) : (
          // Yerel kamera
          <div key="local-video" style={{ width: '100%', height: '100%' }}>
            <VideoRenderer 
              key={`local-${localStream ? localStream.id : 'loading'}`}
              stream={localStream}
              muted 
              mirror={true}
              showQuality={true}
              ref={localVideoRef}
              isRemote={false}
            />
          </div>
        )}
      </div>
      
      {/* Bilgi ve kontrol elemanları katmanı */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000
      }}>
        {/* Hata mesajı */}
        {error && (
          <div style={{ 
            padding: '12px', 
            backgroundColor: 'rgba(239, 68, 68, 0.3)', 
            color: 'white',
            borderRadius: '8px',
            position: 'absolute',
            top: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            maxWidth: '80%',
            textAlign: 'center',
            pointerEvents: 'auto'
          }}>
            {error}
          </div>
        )}
        
        {/* Durum bilgisi alanı */}
        <div style={{
          position: 'absolute',
          top: process.platform === 'darwin' ? '40px' : '10px',
          right: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '8px',
          zIndex: 1001,
          pointerEvents: 'auto'
        }}>
          {/* Oda ID bilgisi */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'white',
            padding: '6px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'center',
            fontFamily: 'monospace',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            '-webkit-app-region': 'no-drag'
          }}>
            <span style={{ marginRight: '6px' }}>Oda: {roomId}</span>
            
            {!copySuccess ? (
              <button
                onMouseDown={(e) => {
                  // Prevent event bubbling and stop dragging behavior
                  e.stopPropagation();
                  
                  try {
                    navigator.clipboard.writeText(roomId);
                    setCopySuccess(true);
                    setTimeout(() => setCopySuccess(false), 2000);
                  } catch (err) {
                    console.error("Kopyalama hatası:", err);
                    // Fallback metodu
                    const textarea = document.createElement('textarea');
                    textarea.value = roomId;
                    textarea.style.position = 'fixed';
                    document.body.appendChild(textarea);
                    textarea.focus();
                    textarea.select();
                    
                    try {
                      document.execCommand('copy');
                      setCopySuccess(true);
                      setTimeout(() => setCopySuccess(false), 2000);
                    } catch (e) {
                      console.error('Fallback kopyalama hatası:', e);
                    }
                    
                    document.body.removeChild(textarea);
                  }
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: 'none',
                  padding: '4px 8px',
                  margin: 0,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '11px',
                  whiteSpace: 'nowrap',
                  '-webkit-app-region': 'no-drag'
                }}
              >
                Kopyala
              </button>
            ) : (
              <span style={{ 
                marginLeft: '4px', 
                fontSize: '11px', 
                color: '#10b981', 
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                padding: '4px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                ✓ Kopyalandı
              </span>
            )}
          </div>
          
          {/* Bağlantı durumu */}
          <div style={{
            backgroundColor: connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.2)' : 
                          connectionStatus === 'connecting' ? 'rgba(245, 158, 11, 0.2)' : 
                          'rgba(239, 68, 68, 0.2)',
            color: connectionStatus === 'connected' ? '#10b981' : 
                connectionStatus === 'connecting' ? '#f59e0b' : 
                '#ef4444',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${connectionStatus === 'connected' ? 'rgba(16, 185, 129, 0.3)' : 
                              connectionStatus === 'connecting' ? 'rgba(245, 158, 11, 0.3)' : 
                              'rgba(239, 68, 68, 0.3)'}`,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
          }}>
            {connectionStatus === 'connected' ? 'Bağlı' : 
            connectionStatus === 'connecting' ? 'Bağlanıyor...' : 'Bağlantı Kesildi'}
          </div>
          
          {/* Video kaynağı bilgisi */}
          <div style={{
            backgroundColor: 'rgba(0,0,0,0.3)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '12px',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: remoteStream ? '#4f46e5' : '#10b981',
              boxShadow: `0 0 4px ${remoteStream ? '#4f46e5' : '#10b981'}`
            }}></div>
            {remoteStream ? 'Uzak Video' : 'Yerel Video'}
          </div>
        </div>

        {/* Alt buton ve kontroller */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'auto'
        }}>
          <div style={{
            display: 'flex',
            gap: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(8px)',
            padding: '8px 16px',
            borderRadius: '100px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            '-webkit-app-region': 'no-drag'
          }}>
            <button 
              onMouseDown={(e) => {
                e.stopPropagation();
                handleToggleMute();
              }}
              disabled={!localStream}
              style={{
                background: 'none',
                border: 'none',
                color: isMuted ? '#ef4444' : 'white',
                height: '44px',
                width: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !localStream ? 'not-allowed' : 'pointer',
                opacity: !localStream ? 0.6 : 1,
                backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {isMuted ? <MicOffIcon /> : <MicIcon />}
            </button>
            
            <button 
              onMouseDown={(e) => {
                e.stopPropagation();
                handleToggleCamera();
              }}
              disabled={!localStream}
              style={{
                background: 'none',
                border: 'none',
                color: isCameraOff ? '#ef4444' : 'white',
                height: '44px',
                width: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !localStream ? 'not-allowed' : 'pointer',
                opacity: !localStream ? 0.6 : 1,
                backgroundColor: isCameraOff ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {isCameraOff ? <VideoOffIcon /> : <VideoIcon />}
            </button>
            
            <button 
              onMouseDown={(e) => {
                e.stopPropagation();
                toggleScreenShare();
              }}
              disabled={!localStream}
              style={{
                background: 'none',
                border: 'none',
                color: isScreenSharing ? '#ef4444' : 'white',
                height: '44px',
                width: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: !localStream ? 'not-allowed' : 'pointer',
                opacity: !localStream ? 0.6 : 1,
                backgroundColor: isScreenSharing ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.2)'
              }}
            >
              {isScreenSharing ? <StopScreenShareIcon /> : <ScreenShareIcon />}
            </button>
            
            <button 
              onMouseDown={(e) => {
                e.stopPropagation();
                setShowSettings(!showSettings);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                height: '44px',
                width: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }}
            >
              <SettingsIcon />
            </button>
            
            <button 
              onMouseDown={(e) => {
                e.stopPropagation();
                handleEndCall();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                height: '44px',
                width: '44px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: '#ef4444',
                marginLeft: '8px'
              }}
            >
              <PhoneOffIcon />
            </button>
          </div>
        </div>
        
        {/* Ayarlar menüsü */}
        {showSettings && renderSettings()}
        
        {/* Ekran paylaşım durumu */}
        {isScreenSharing && (
          <div style={{
            position: 'absolute',
            top: '70px',
            right: '10px',
            padding: '8px 12px',
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            color: '#10b981',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: 'bold',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            pointerEvents: 'auto'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: 'pulse 1.5s infinite'
            }} />
            <span>Ekran Paylaşımı Aktif</span>
          </div>
        )}
        
        {/* Kendi görüntüsü (PiP) */}
        {remoteStream && localStream && !isRemoteScreenShare && (
          <div style={{
            position: 'absolute',
            bottom: '100px',
            right: '20px',
            width: '180px',
            height: '120px',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            pointerEvents: 'auto'
          }}>
            <VideoRenderer 
              key={`pip-${localStream.id}`}
              stream={localStream}
              muted 
              mirror={true}
              ref={localVideoRef}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default CallPage;