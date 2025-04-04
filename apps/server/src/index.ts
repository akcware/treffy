import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { socketHandler } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());

// Basit health check endpoint'i
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Socket.io bağlantı olayını dinle
io.on('connection', socketHandler(io));

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Sinyal sunucusu ${PORT} portunda çalışıyor`);
});