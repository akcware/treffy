const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const activeUsers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (!userId) {
    console.log('Kullanıcı kimliği olmadan bağlantı reddedildi');
    socket.disconnect();
    return;
  }
  
  console.log(`Kullanıcı bağlandı: ${userId}`);
  activeUsers.set(userId, { socketId: socket.id, rooms: new Set() });
  
  socket.on('join-room', ({ roomId, userId }) => {
    console.log(`${userId} kullanıcısı ${roomId} odasına katılıyor`);
    
    socket.join(roomId);
    
    // Kullanıcının katıldığı odaları takip et
    const userData = activeUsers.get(userId);
    if (userData) {
      userData.rooms.add(roomId);
    }
    
    // Oda yoksa oluştur
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    
    // Kullanıcıyı odaya ekle
    const room = rooms.get(roomId);
    room.add(userId);
    
    // Odadaki diğer kullanıcılara bildir
    socket.to(roomId).emit('signaling-message', {
      type: 'user-joined',
      from: userId,
      to: roomId,
      payload: { userId }
    });
  });
  
  socket.on('leave-room', ({ roomId, userId }) => {
    console.log(`${userId} kullanıcısı ${roomId} odasından ayrılıyor`);
    
    socket.leave(roomId);
    
    // Kullanıcının katıldığı odalardan çıkar
    const userData = activeUsers.get(userId);
    if (userData) {
      userData.rooms.delete(roomId);
    }
    
    // Kullanıcıyı odadan çıkar
    const room = rooms.get(roomId);
    if (room) {
      room.delete(userId);
      
      // Oda boşaldıysa odayı sil
      if (room.size === 0) {
        rooms.delete(roomId);
      }
    }
    
    // Odadaki diğer kullanıcılara bildir
    socket.to(roomId).emit('signaling-message', {
      type: 'user-left',
      from: userId,
      to: roomId,
      payload: { userId }
    });
  });
  
  socket.on('signaling-message', (message) => {
    console.log(`Sinyal mesajı alındı: ${message.type} - ${message.from} -> ${message.to}`);
    
    // Belirli bir kullanıcıya mesaj gönderme
    if (message.to) {
      const isRoom = rooms.has(message.to);
      
      if (isRoom) {
        // Odadaki tüm kullanıcılara mesaj gönder (göndereni hariç)
        socket.to(message.to).emit('signaling-message', message);
      } else {
        // Belirli bir kullanıcıya mesaj gönder
        const targetUser = activeUsers.get(message.to);
        if (targetUser) {
          io.to(targetUser.socketId).emit('signaling-message', message);
        }
      }
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`Kullanıcı ayrıldı: ${userId}`);
    
    const userData = activeUsers.get(userId);
    
    if (userData) {
      // Kullanıcının olduğu tüm odalardan çıkar
      userData.rooms.forEach(roomId => {
        const room = rooms.get(roomId);
        if (room) {
          room.delete(userId);
          
          // Oda boşaldıysa odayı sil
          if (room.size === 0) {
            rooms.delete(roomId);
          }
          
          // Odadaki diğer kullanıcılara bildir
          socket.to(roomId).emit('signaling-message', {
            type: 'user-left',
            from: userId,
            to: roomId,
            payload: { userId }
          });
        }
      });
      
      // Kullanıcıyı aktif listeden çıkar
      activeUsers.delete(userId);
    }
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Sinyal sunucusu ${PORT} portunda çalışıyor`);
});
