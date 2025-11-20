export enum HoodieColor {
  GREEN = 'Green',
  BLACK = 'Black',
  WHITE = 'White'
}

export interface GenerationState {
  isGenerating: boolean;
  resultImage: string | null;
  error: string | null;
}

export interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
}

export type HoodieTemplates = Record<HoodieColor, string | null>;
