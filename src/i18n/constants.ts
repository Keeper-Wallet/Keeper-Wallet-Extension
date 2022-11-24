export const SUPPORTED_LANGUAGES = [
  { id: 'en', name: 'English' },
  { id: 'ru', name: 'Русский' },
  { id: 'tr', name: 'Türkçe' },
  { id: 'pt', name: 'Portugal' },
  { id: 'es', name: 'Español' },
  { id: 'id', name: 'Bahasa Indonesia' },
  { id: 'ja', name: '日本語' },
  { id: 'th', name: 'ภาษาไทย' },
  { id: 'vi', name: 'tiếng Việt' },
  { id: 'zh', name: '中文' },
].sort((a, b) => a.name.localeCompare(b.name));
