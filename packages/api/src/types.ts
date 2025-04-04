export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  roomId: string;
  initiatorId: string;
  participantId?: string;
  status: 'pending' | 'active' | 'completed' | 'missed';
  startedAt: string;
  endedAt?: string;
}

export interface Contact {
  id: string;
  userId: string;
  contactId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallSettings {
  video: boolean;
  audio: boolean;
  preferredVideoInput?: string;
  preferredAudioInput?: string;
  preferredAudioOutput?: string;
}