export interface WheelOption {
  id: string;
  label: string;
  color: string;
  weight: number;
  imageId?: string;
  winCount: number;
}

export interface WheelSettings {
  spinDuration: number;
  soundEnabled: boolean;
  removeWinnerAfterSpin: boolean;
  winnerCount: number;
  showImages: boolean;
}

export interface SavedWheel {
  id: string;
  name: string;
  options: WheelOption[];
  settings: WheelSettings;
  createdAt: number;
  updatedAt: number;
}

export interface SpinResult {
  id: string;
  wheelId: string;
  winnerIds: string[];
  winnerLabels: string[];
  timestamp: number;
}

export interface WheelImage {
  id: string;
  blob: Blob;
  mimeType: string;
  width: number;
  height: number;
}

export interface WheelTemplate {
  id: string;
  name: string;
  options: string[];
}

export type WheelStatus = 'idle' | 'spinning' | 'finished' | 'error';
