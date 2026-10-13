export type SpeakerStatus = 'pending' | 'invited' | 'confirmed' | 'declined';

export interface ProspectiveSpeaker {
  id?: number;
  name: string;
  email?: string;
  phone?: string;
  church?: string;
  topic?: string;
  status?: SpeakerStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
