import SimplePeer from 'simple-peer';
import { PeerConnectionOptions, SignalingMessage } from '../types';

export class PeerConnection {
  private peer: SimplePeer.Instance | null = null;
  private stream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private connectedCallback: (() => void) | null = null;
  private disconnectedCallback: (() => void) | null = null;
  private streamCallback: ((stream: MediaStream) => void) | null = null;

  constructor(private options: PeerConnectionOptions) {
    this.stream = options.stream || null;
  }

  init() {
    this.peer = new SimplePeer({
      initiator: this.options.initiator,
      stream: this.stream || undefined,
      trickle: true,
      config: this.options.config || {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
        ]
      }
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.peer) return;

    this.peer.on('signal', (data: any) => {
      // Sinyal verisi üretildi, bu veriyi karşı tarafa göndermek için
      // Sinyal sunucusu aracılığıyla iletilmeli
      console.log('Signal data generated', data);
    });

    this.peer.on('connect', () => {
      console.log('Peer connection established');
      if (this.connectedCallback) {
        this.connectedCallback();
      }
    });

    this.peer.on('stream', (stream: MediaStream) => {
      console.log('Remote stream received', stream);
      this.remoteStream = stream;
      if (this.streamCallback) {
        this.streamCallback(stream);
      }
    });

    this.peer.on('close', () => {
      console.log('Peer connection closed');
      this.remoteStream = null;
      if (this.disconnectedCallback) {
        this.disconnectedCallback();
      }
    });

    this.peer.on('error', (err: Error) => {
      console.error('Peer connection error:', err);
      if (this.disconnectedCallback) {
        this.disconnectedCallback();
      }
    });
  }

  signal(data: any) {
    if (this.peer) {
      this.peer.signal(data);
    }
  }

  send(data: string | Blob | ArrayBuffer) {
    if (this.peer && this.peer.connected) {
      this.peer.send(data);
    }
  }

  replaceStream(stream: MediaStream) {
    this.stream = stream;
    if (this.peer) {
      this.peer.removeStream(this.stream);
      this.peer.addStream(stream);
    }
  }

  destroy() {
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
  }

  onConnected(callback: () => void) {
    this.connectedCallback = callback;
  }

  onDisconnected(callback: () => void) {
    this.disconnectedCallback = callback;
  }

  onStream(callback: (stream: MediaStream) => void) {
    this.streamCallback = callback;
    // Eğer zaten bir uzak akış varsa, geri çağrıyı hemen çağır
    if (this.remoteStream && callback) {
      callback(this.remoteStream);
    }
  }

  getRemoteStream() {
    return this.remoteStream;
  }
}