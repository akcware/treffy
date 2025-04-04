export interface PeerConnectionOptions {
  initiator: boolean;
  stream?: MediaStream;
  config?: RTCConfiguration;
}

export interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left';
  from: string;
  to?: string;
  payload: any;
}

export interface MediaDeviceInfo {
  deviceId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
}

export interface CallState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: 'new' | 'connecting' | 'connected' | 'disconnected' | 'failed';
  isMuted: boolean;
  isCameraOff: boolean;
  isScreenSharing: boolean;
}