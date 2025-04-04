import { Server, Socket } from 'socket.io';

interface UserData {
  socketId: string;
  userId: string;
  rooms: Set<string>;
}

// Aktif kullanıcılar
const activeUsers = new Map<string, UserData>();

export const socketHandler = (io: Server) => (socket: Socket) => {
  const userId = socket.handshake.query.userId as string;
  
  if (!userId) {
    console.log('Kullanıcı kimliği olmadan bağlantı reddedildi');
    socket.disconnect();
    return;
  }

  console.log(`Kullanıcı bağlandı: ${userId}`);
  
  // Kullanıcıyı aktif kullanıcılara ekle
  activeUsers.set(userId, {
    socketId: socket.id,
    userId,
    rooms: new Set()
  });

  // Bir odaya katılma isteği
  socket.on('join-room', ({ roomId }: { roomId: string; userId: string }) => {
    console.log(`Kullanıcı ${userId} oda ${roomId}'ye katıldı`);
    
    socket.join(roomId);
    
    const userData = activeUsers.get(userId);
    if (userData) {
      userData.rooms.add(roomId);
    }
    
    // Odadaki diğer kullanıcılara bildirim gönder
    socket.to(roomId).emit('signaling-message', {
      type: 'user-joined',
      from: userId,
      payload: { userId }
    });
  });

  // Bir odadan ayrılma isteği
  socket.on('leave-room', ({ roomId }: { roomId: string; userId: string }) => {
    console.log(`Kullanıcı ${userId} oda ${roomId}'den ayrıldı`);
    
    socket.leave(roomId);
    
    const userData = activeUsers.get(userId);
    if (userData) {
      userData.rooms.delete(roomId);
    }
    
    // Odadaki diğer kullanıcılara bildirim gönder
    socket.to(roomId).emit('signaling-message', {
      type: 'user-left',
      from: userId,
      payload: { userId }
    });
  });

  // Sinyalleşme mesajlarını iletme
  socket.on('signaling-message', (message: any) => {
    console.log(`Sinyalleşme mesajı alındı: ${message.type} from ${message.from} to ${message.to}`);
    
    // Belirli bir kullanıcıya mesaj gönderme
    if (message.to) {
      const userData = activeUsers.get(message.to);
      if (userData) {
        io.to(userData.socketId).emit('signaling-message', message);
      }
    } 
    // Bir odadaki herkese mesaj gönderme
    else if (message.roomId) {
      socket.to(message.roomId).emit('signaling-message', message);
    }
  });

  // Bağlantı kesildiğinde
  socket.on('disconnect', () => {
    console.log(`Kullanıcı ayrıldı: ${userId}`);
    
    const userData = activeUsers.get(userId);
    if (userData) {
      // Kullanıcının olduğu tüm odalara ayrılma bildirimi gönder
      userData.rooms.forEach(roomId => {
        socket.to(roomId).emit('signaling-message', {
          type: 'user-left',
          from: userId,
          payload: { userId }
        });
      });
      
      // Kullanıcıyı aktif listeden kaldır
      activeUsers.delete(userId);
    }
  });
};