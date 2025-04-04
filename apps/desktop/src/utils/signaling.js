import { io } from 'socket.io-client';

export function createSignalingClient(url) {
  let socket = null;
  
  const listeners = {
    connect: [],
    disconnect: [],
    signaling: []
  };
  
  function setupSocketListeners() {
    socket.on('connect', () => {
      console.log('Sinyal sunucusuna bağlandı, socket ID:', socket.id);
      listeners.connect.forEach(callback => callback());
    });
    
    socket.on('connect_error', (error) => {
      console.error('Sinyal sunucusuna bağlantı hatası:', error.message);
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Sinyal sunucusundan bağlantı kesildi:', reason);
      listeners.disconnect.forEach(callback => callback());
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Sinyal sunucusuna yeniden bağlanma denemesi:', attemptNumber);
    });
    
    socket.on('signaling-message', (message) => {
      console.log('Sinyal mesajı alındı:', message.type, 'from:', message.from);
      listeners.signaling.forEach(callback => callback(message));
    });
  }
  
  return {
    connect(userId) {
      if (!userId) {
        console.error('Kullanıcı kimliği belirtilmedi');
        return;
      }
      
      if (!socket) {
        console.log('Soket bağlantısı oluşturuluyor, userId:', userId);
        socket = io(url, {
          query: { userId },
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 10000,
          autoConnect: true,
          forceNew: true
        });
        
        setupSocketListeners();
      } else if (!socket.connected) {
        console.log('Soket bağlantısı yenileniyor...');
        socket.io.opts.query = { userId };
        socket.connect();
      }
    },
    
    disconnect() {
      if (socket) {
        socket.disconnect();
      }
    },
    
    sendMessage(message) {
      if (socket && socket.connected) {
        console.log('Mesaj gönderiliyor:', message);
        socket.emit('signaling-message', message);
      } else {
        console.error('Mesaj gönderilemedi: Bağlantı yok');
      }
    },
    
    joinRoom(roomId, userId) {
      if (socket && socket.connected) {
        console.log('Odaya katılınıyor:', roomId, 'kullanıcı:', userId);
        socket.emit('join-room', { roomId, userId });
      } else {
        console.error('Odaya katılınamadı: Bağlantı yok');
      }
    },
    
    leaveRoom(roomId, userId) {
      if (socket && socket.connected) {
        socket.emit('leave-room', { roomId, userId });
      }
    },
    
    onConnect(callback) {
      listeners.connect.push(callback);
      // Eğer zaten bağlıysa hemen çağır
      if (socket && socket.connected) {
        callback();
      }
    },
    
    onDisconnect(callback) {
      listeners.disconnect.push(callback);
    },
    
    onSignalingMessage(callback) {
      listeners.signaling.push(callback);
    }
  };
}
