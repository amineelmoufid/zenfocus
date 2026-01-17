
export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  label: string;
}

export interface FocusBlock {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
}

export type ViewState = 'dashboard' | 'timer';
