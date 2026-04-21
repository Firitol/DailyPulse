
export type UserRole = 'patient' | 'doctor';
export type MoodType = 'Happy' | 'Calm' | 'Stressed' | 'Sad' | 'Angry' | 'Motivated' | 'Tired';

export interface MoodEntry {
  id: string;
  userId: string;
  mood: MoodType;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  message?: string;
  suggestions?: string[];
  moodGuideMessageId: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  createdAt: any;
  onboardingCompleted: boolean;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialization: string;
  bio: string;
  isVerified: boolean;
}

export interface Assignment {
  id: string;
  patientId: string;
  doctorId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string;
  content: string;
  createdAt: string;
  likeCount: number;
}

export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export const MOODS: { label: MoodType; emoji: string; color: string }[] = [
  { label: 'Happy', emoji: '😊', color: 'bg-yellow-100 text-yellow-700' },
  { label: 'Calm', emoji: '😌', color: 'bg-blue-100 text-blue-700' },
  { label: 'Motivated', emoji: '💪', color: 'bg-green-100 text-green-700' },
  { label: 'Tired', emoji: '😴', color: 'bg-gray-100 text-gray-700' },
  { label: 'Stressed', emoji: '😰', color: 'bg-orange-100 text-orange-700' },
  { label: 'Sad', emoji: '😢', color: 'bg-indigo-100 text-indigo-700' },
  { label: 'Angry', emoji: '😠', color: 'bg-red-100 text-red-700' },
];
