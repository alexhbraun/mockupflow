export type ChannelType = 'WEB' | 'SMS';

export type StepType = 'BOT_MESSAGE' | 'USER_MESSAGE' | 'INPUT_CAPTURE' | 'QUICK_REPLIES';

export type InputFieldType = 'text' | 'email' | 'phone';

export interface Step {
  id: string;
  type: StepType;
  delayMs?: number;
  // For Messages
  text?: string;
  // For Input Capture
  prompt?: string;
  fieldKey?: string;
  fieldType?: InputFieldType;
  required?: boolean;
  validationHint?: string;
  // For Quick Replies
  options?: string[];
}

export interface MockupTheme {
  chatTitle: string;
  primaryColor: string;
  headerTextColor: string;
  iconColor: string;
}

export interface MockupAssets {
  backgroundUrl: string;
  logoUrl?: string;
  avatarUrl?: string;
}

export interface Mockup {
  id?: string;
  ownerId: string;
  shareId: string;
  name: string;
  description: string;
  prompt?: string; // AI generation prompt
  channel: ChannelType;
  theme: MockupTheme;
  assets: MockupAssets;
  flow: Step[];
  createdAt: any;
  updatedAt: any;
}

export interface Session {
  id?: string;
  mockupId: string;
  shareId: string;
  startedAt: any;
  lastActiveAt: any;
  completedAt?: any;
  currentStepIndex: number;
  captured: Record<string, any>;
  durationSeconds: number;
}
