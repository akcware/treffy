// packages/webrtc/src/media/media-devices.ts
// Medya cihazları için yardımcı fonksiyonlar
import { MediaDeviceInfo } from '../types';

export async function getMediaDevices(): Promise<{
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
}> {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    
    const audioInputs = devices
      .filter(device => device.kind === 'audioinput')
      .map(device => ({
        deviceId: device.deviceId,
        kind: 'audioinput' as const,
        label: device.label || `Mikrofon ${device.deviceId.slice(0, 5)}...`
      }));
    
    const audioOutputs = devices
      .filter(device => device.kind === 'audiooutput')
      .map(device => ({
        deviceId: device.deviceId,
        kind: 'audiooutput' as const,
        label: device.label || `Hoparlör ${device.deviceId.slice(0, 5)}...`
      }));
    
    const videoInputs = devices
      .filter(device => device.kind === 'videoinput')
      .map(device => ({
        deviceId: device.deviceId,
        kind: 'videoinput' as const,
        label: device.label || `Kamera ${device.deviceId.slice(0, 5)}...`
      }));
    
    return { audioInputs, audioOutputs, videoInputs };
  } catch (error) {
    console.error('Medya cihazları alınamadı:', error);
    return { audioInputs: [], audioOutputs: [], videoInputs: [] };
  }
}

export async function getUserMedia(constraints: MediaStreamConstraints = { audio: true, video: true }): Promise<MediaStream | null> {
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    console.error('Medya akışı alınamadı:', error);
    return null;
  }
}

export async function getDisplayMedia(): Promise<MediaStream | null> {
  try {
    // @ts-ignore: TypeScript, getDisplayMedia'yı tanımıyor olabilir
    return await navigator.mediaDevices.getDisplayMedia({ video: true });
  } catch (error) {
    console.error('Ekran paylaşımı başlatılamadı:', error);
    return null;
  }
}

export function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;
  
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

export function toggleAudio(stream: MediaStream | null, enabled: boolean): boolean {
  if (!stream) return false;
  
  const audioTracks = stream.getAudioTracks();
  audioTracks.forEach(track => {
    track.enabled = enabled;
  });
  
  return audioTracks.length > 0;
}

export function toggleVideo(stream: MediaStream | null, enabled: boolean): boolean {
  if (!stream) return false;
  
  const videoTracks = stream.getVideoTracks();
  videoTracks.forEach(track => {
    track.enabled = enabled;
  });
  
  return videoTracks.length > 0;
}

export async function getUserMediaWithDevice(audioDeviceId?: string, videoDeviceId?: string): Promise<MediaStream | null> {
  const constraints: MediaStreamConstraints = {
    audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
    video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true
  };
  
  return getUserMedia(constraints);
}

export async function getAudioOnlyMedia(deviceId?: string): Promise<MediaStream | null> {
  const constraints: MediaStreamConstraints = {
    audio: deviceId ? { deviceId: { exact: deviceId } } : true,
    video: false
  };
  
  return getUserMedia(constraints);
}

export async function getVideoOnlyMedia(deviceId?: string): Promise<MediaStream | null> {
  const constraints: MediaStreamConstraints = {
    audio: false,
    video: deviceId ? { deviceId: { exact: deviceId } } : true
  };
  
  return getUserMedia(constraints);
}

export async function getHighQualityVideoMedia(deviceId?: string): Promise<MediaStream | null> {
  const constraints: MediaStreamConstraints = {
    audio: true,
    video: {
      deviceId: deviceId ? { exact: deviceId } : undefined,
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 60 }
    }
  };
  
  return getUserMedia(constraints);
}

export function getMediaStreamTracks(stream: MediaStream | null): {
  audioTracks: MediaStreamTrack[];
  videoTracks: MediaStreamTrack[];
} {
  if (!stream) {
    return { audioTracks: [], videoTracks: [] };
  }
  
  const audioTracks = stream.getAudioTracks();
  const videoTracks = stream.getVideoTracks();
  
  return { audioTracks, videoTracks };
}

export function combineMediaStreams(...streams: (MediaStream | null)[]): MediaStream {
  const combinedStream = new MediaStream();
  
  streams.forEach(stream => {
    if (stream) {
      stream.getTracks().forEach(track => {
        combinedStream.addTrack(track);
      });
    }
  });
  
  return combinedStream;
}

export function setAudioOutput(element: HTMLMediaElement, deviceId: string): Promise<void> {
  if (!element.setSinkId) {
    return Promise.reject(new Error('setSinkId desteklenmiyor'));
  }
  
  // @ts-ignore: TypeScript, setSinkId'yi tanımıyor olabilir
  return element.setSinkId(deviceId);
}

export function getMediaConstraints(options: {
  audio?: boolean;
  video?: boolean;
  audioDeviceId?: string;
  videoDeviceId?: string;
  highQuality?: boolean;
}): MediaStreamConstraints {
  const constraints: MediaStreamConstraints = {};
  
  if (options.audio) {
    constraints.audio = options.audioDeviceId 
      ? { deviceId: { exact: options.audioDeviceId } } 
      : true;
  } else {
    constraints.audio = false;
  }
  
  if (options.video) {
    if (options.highQuality) {
      constraints.video = {
        deviceId: options.videoDeviceId ? { exact: options.videoDeviceId } : undefined,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: { ideal: 60 }
      };
    } else {
      constraints.video = options.videoDeviceId 
        ? { deviceId: { exact: options.videoDeviceId } } 
        : true;
    }
  } else {
    constraints.video = false;
  }
  
  return constraints;
}