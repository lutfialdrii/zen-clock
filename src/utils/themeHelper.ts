export interface ThemeVariables {
  hex: string;
  hover: string;
  text: string;
  glow: string;
}

export interface AccentPreset {
  id: string;
  name: string;
  description: string;
  hex: string;
  hover: string;
  text: string;
  glow: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  {
    id: 'amber',
    name: '🟡 Warm Amber (Default)',
    description: 'Spiritual warm gold (#fbbf24) - Zen & Mindful',
    hex: '#fbbf24',
    hover: '#f59e0b',
    text: '#1c1917',
    glow: 'rgba(251, 191, 36, 0.35)'
  },
  {
    id: 'emerald',
    name: '🟢 Islamic Emerald',
    description: 'Peaceful classic Islamic green (#10b981)',
    hex: '#10b981',
    hover: '#059669',
    text: '#ffffff',
    glow: 'rgba(16, 185, 129, 0.35)'
  },
  {
    id: 'cyan',
    name: '🔵 Modern Sky Cyan',
    description: 'Vibrant VS Code style cyan (#38bdf8)',
    hex: '#38bdf8',
    hover: '#0284c7',
    text: '#0f172a',
    glow: 'rgba(56, 189, 248, 0.35)'
  },
  {
    id: 'rose',
    name: '🔴 Pomodoro Rose',
    description: 'Energetic focus crimson (#f43f5e)',
    hex: '#f43f5e',
    hover: '#e11d48',
    text: '#ffffff',
    glow: 'rgba(244, 63, 94, 0.35)'
  },
  {
    id: 'purple',
    name: '🟣 Mystic Purple',
    description: 'Calming focused amethyst (#a855f7)',
    hex: '#a855f7',
    hover: '#9333ea',
    text: '#ffffff',
    glow: 'rgba(168, 85, 247, 0.35)'
  },
  {
    id: 'silver',
    name: '⚪ Monochrome Silver',
    description: 'Minimalist clean silver (#e2e8f0)',
    hex: '#e2e8f0',
    hover: '#cbd5e1',
    text: '#0f172a',
    glow: 'rgba(226, 232, 240, 0.35)'
  }
];

export const DEFAULT_ACCENT_COLOR = '#fbbf24';

function parseHex(hexStr: string): { r: number; g: number; b: number } | null {
  let cleaned = hexStr.trim().replace(/^#/, '');
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (cleaned.length !== 6) {
    return null;
  }
  const num = parseInt(cleaned, 16);
  if (isNaN(num)) {
    return null;
  }
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  return (
    '#' +
    [clamp(r), clamp(g), clamp(b)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export function getThemeVariables(inputColor?: string): ThemeVariables {
  const color = (inputColor || DEFAULT_ACCENT_COLOR).trim().toLowerCase();

  // 1. Check if matches any preset ID or preset Hex
  const matchedPreset = ACCENT_PRESETS.find(
    (p) => p.id === color || p.hex.toLowerCase() === color
  );
  if (matchedPreset) {
    return {
      hex: matchedPreset.hex,
      hover: matchedPreset.hover,
      text: matchedPreset.text,
      glow: matchedPreset.glow
    };
  }

  // 2. Parse custom Hex
  const rgb = parseHex(color);
  if (!rgb) {
    // Fallback to default
    const fallback = ACCENT_PRESETS[0];
    return {
      hex: fallback.hex,
      hover: fallback.hover,
      text: fallback.text,
      glow: fallback.glow
    };
  }

  // Calculate contrast text (luminance formula)
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b);
  const text = luminance > 155 ? '#111827' : '#ffffff';

  // Calculate darker hover shade
  const hover = rgbToHex(rgb.r * 0.88, rgb.g * 0.88, rgb.b * 0.88);
  const glow = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.35)`;
  const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

  return {
    hex,
    hover,
    text,
    glow
  };
}
