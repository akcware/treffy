// WebRTC yardımcı fonksiyonları

// Medya akışı al
export async function getUserMedia(constraints = { audio: true, video: true }) {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Tarayıcınız mediaDevices.getUserMedia API\'sini desteklemiyor');
    }
    
    console.log('getUserMedia çağrılıyor, kısıtlar:', constraints);
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    console.log('Stream alındı:', stream.id);
    console.log('Track sayısı:', stream.getTracks().length);
    console.log('Track tipleri:', stream.getTracks().map(t => t.kind).join(', '));
    
    return stream;
  } catch (error) {
    console.error('Medya akışı alınamadı:', error);
    throw error;
  }
}

// Medya akışını durdur
export function stopMediaStream(stream) {
  if (!stream) return;
  stream.getTracks().forEach(track => track.stop());
}

// Ses açma/kapama
export function toggleAudio(stream, enabled) {
  if (!stream) return false;
  const audioTracks = stream.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = enabled;
  });
  return audioTracks.length > 0;
}

// Video açma/kapama
export function toggleVideo(stream, enabled) {
  if (!stream) return false;
  const videoTracks = stream.getVideoTracks();
  videoTracks.forEach(track => {
    track.enabled = enabled;
  });
  return videoTracks.length > 0;
}

// Doğrudan WebRTC bağlantısı kur - Güvenilir STUN sunucuları
export function createPeerConnection(config = {}) {
  // Sadece STUN sunucuları kullan (TURN sunucuları çözümlenemiyor)
  const iceServers = config.iceServers || [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" }
  ];
  
  const peerConnection = new RTCPeerConnection({
    iceServers: iceServers,
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
    sdpSemantics: 'unified-plan'
  });
  
  console.log('PeerConnection oluşturuldu');
  
  // ICE bağlantı durumunu izle
  peerConnection.oniceconnectionstatechange = () => {
    console.log('ICE bağlantı durumu:', peerConnection.iceConnectionState);
    
    // ICE bağlantı durumu "failed" veya "disconnected" olduğunda yeniden bağlanma dene
    if (peerConnection.iceConnectionState === 'failed' || 
        peerConnection.iceConnectionState === 'disconnected') {
      console.log('⚠️ ICE bağlantısı başarısız veya koptu, yeniden bağlanma deneniyor...');
      // Bağlantı durumunu sıfırla ve yeniden aday toplamaya başla
      try {
        peerConnection.restartIce();
      } catch (error) {
        console.error('ICE yeniden başlatma hatası:', error);
      }
    }
  };
  
  // Bağlantı durumunu izle
  peerConnection.onconnectionstatechange = () => {
    console.log('Bağlantı durumu:', peerConnection.connectionState);
  };
  
  // Uzak ekran paylaşımı bilgilerini ekle
  peerConnection.getNegotiationNeededEvents = function() {
    return this._negotiationNeededEvents || [];
  };
  
  // Ekstra - medya isim bilgileri için başlıkları koru
  peerConnection._origSetRemoteDescription = peerConnection.setRemoteDescription;
  peerConnection.setRemoteDescription = async function(desc) {
    // SDP açıklamalarını günlükle
    console.log('Uzak açıklama ayarlanıyor:', desc.type);
    console.log('SDP içeriği:', desc.sdp.substring(0, 100) + '...');
    
    // Track etiketlerini günlükle (hata ayıklama için)
    try {
      const trackLabels = desc.sdp.match(/a=label:(.*)/g);
      if (trackLabels && trackLabels.length > 0) {
        console.log('Track etiketleri:', trackLabels);
      }
    } catch (error) {
      console.error('Track etiketleri çıkarılamadı:', error);
    }
    
    // Orijinal metodu çağır
    return this._origSetRemoteDescription.call(this, desc);
  };
  
  return peerConnection;
}

// WebRTC teklif oluştur
export async function createOffer(peerConnection) {
  try {
    console.log('Teklif oluşturuluyor...');
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    console.log('Teklif oluşturuldu, yerel tanımlama yapılıyor...');
    await peerConnection.setLocalDescription(offer);
    console.log('Yerel tanımlama tamamlandı');
    
    return offer;
  } catch (error) {
    console.error('Teklif oluşturma hatası:', error);
    throw error;
  }
}

// WebRTC cevap oluştur
export async function createAnswer(peerConnection) {
  try {
    console.log('Cevap oluşturuluyor...');
    const answer = await peerConnection.createAnswer();
    
    console.log('Cevap oluşturuldu, yerel tanımlama yapılıyor...');
    await peerConnection.setLocalDescription(answer);
    console.log('Yerel tanımlama tamamlandı');
    
    return answer;
  } catch (error) {
    console.error('Cevap oluşturma hatası:', error);
    throw error;
  }
}

// Uzak tanımlamayı ayarla
export async function setRemoteDescription(peerConnection, description) {
  try {
    console.log('Uzak tanımlama ayarlanıyor...');
    
    // Description objesi kontrolü
    if (!description || (!description.sdp && !description.type)) {
      console.error('Geçersiz tanımlama:', description);
      throw new Error('Geçersiz SDP tanımlaması');
    }
    
    // Uzak tanımlama
    await peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    console.log('Uzak tanımlama başarıyla ayarlandı');
  } catch (error) {
    console.error('Uzak tanımlama ayarlama hatası:', error);
    throw error;
  }
}

// ICE aday ekle
export async function addIceCandidate(peerConnection, candidate) {
  try {
    if (!candidate) {
      console.warn('Boş ICE adayı, atlanıyor');
      return;
    }
    
    console.log('ICE adayı ekleniyor:', typeof candidate, candidate.candidate ? candidate.candidate.substring(0, 30) + '...' : 'candidate özelliği yok');
    
    // Aday nesnesi kontrolü
    if (!candidate.candidate && !candidate.sdpMid && !candidate.sdpMLineIndex) {
      console.error('Geçersiz ICE adayı:', candidate);
      return;
    }
    
    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    console.log('ICE adayı başarıyla eklendi');
  } catch (error) {
    console.error('ICE aday ekleme hatası:', error);
    // Bu hata kritik değil, çoğu zaman göz ardı edilebilir
  }
}
