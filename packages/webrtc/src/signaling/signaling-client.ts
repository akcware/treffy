import { io, Socket } from 'socket.io-client';
import { SignalingMessage } from '../types';

export class SignalingClient {
  private socket: Socket | null = null;
  private messageCallback: ((message: SignalingMessage) => void) | null = null;
  private connectedCallback: (() => void) | null = null;
  private disconnectedCallback: (() => void) | null = null;
  private userId: string = '';

  constructor(private url: string) {}

  connect(userId: string) {
    this.userId = userId;
    this.socket = io(this.url, {
      query: { userId }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to signaling server');
      if (this.connectedCallback) {
        this.connectedCallback();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from signaling server');
      if (this.disconnectedCallback) {
        this.disconnectedCallback();
      }
    });

    this.socket.on('signaling-message', (message: SignalingMessage) => {
      console.log('Signaling message received', message);
      if (this.messageCallback) {
        this.messageCallback(message);
      }
    });
  }

  sendMessage(message: Omit<SignalingMessage, 'from'>) {
    if (this.socket && this.socket.connected) {
      const fullMessage: SignalingMessage = {
        ...message,
        from: this.userId
      };
      this.socket.emit('signaling-message', fullMessage);
    }
  }

  joinRoom(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('join-room', { roomId, userId: this.userId });
    }
  }

  leaveRoom(roomId: string) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave-room', { roomId, userId: this.userId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onMessage(callback: (message: SignalingMessage) => void) {
    this.messageCallback = callback;
  }

  onConnected(callback: () => void) {
    this.connectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.disconnectedCallback = callback;
  }
}