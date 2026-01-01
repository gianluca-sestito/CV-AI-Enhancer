export interface CVEditorSettings {
  fontFamily: 'serif' | 'sans-serif' | 'mixed';
  colorScheme: 'warm' | 'cool' | 'minimal' | 'custom';
  layout: 'traditional' | 'modern' | 'compact';
  customColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  spacing: 'compact' | 'normal' | 'spacious';
  fontSize: 'small' | 'medium' | 'large';
}

export const defaultSettings: CVEditorSettings = {
  fontFamily: 'sans-serif',
  colorScheme: 'warm',
  layout: 'traditional',
  spacing: 'normal',
  fontSize: 'medium',
};

const STORAGE_KEY_PREFIX = 'cv-editor-settings-';

export function loadSettings(cvId: string): CVEditorSettings {
  if (typeof window === 'undefined') return defaultSettings;
  
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${cvId}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  
  return defaultSettings;
}

export function saveSettings(cvId: string, settings: CVEditorSettings): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${cvId}`, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving settings:', error);
  }
}

