/**
 * Tokens oficiales del Sistema de Diseño Samsung One UI 6/7 + MisAhorros
 * Incluye paletas Dark/AMOLED/Light, 5 Colores Acento, 3 Tipografías y Físicas de Resorte.
 */

export type ThemeMode = 'dark' | 'light' | 'amoled';
export type AccentColorKey = 'emerald' | 'ocean' | 'gold' | 'amethyst' | 'coral';
export type FontFamilyKey = 'jakarta' | 'inter' | 'space_grotesk';
export type ProfileType = 'personal' | 'business';
export type CurrencyCode = 'HNL' | 'USD' | 'EUR' | 'MXN';

export const SAMSUNG_SPRING = {
  snappy: {
    damping: 24,
    stiffness: 260,
    mass: 0.9,
  },
  smooth: {
    damping: 28,
    stiffness: 180,
    mass: 1.0,
  },
  pressIn: {
    damping: 20,
    stiffness: 350,
    mass: 0.7,
  },
};

export const ACCENT_PALETTES: Record<
  AccentColorKey,
  {
    name: string;
    primary: string;
    secondary: string;
    glow: string;
    softBg: string;
  }
> = {
  emerald: {
    name: 'Esmeralda FinTech',
    primary: '#10B981',
    secondary: '#06B6D4',
    glow: 'rgba(16, 185, 129, 0.25)',
    softBg: 'rgba(16, 185, 129, 0.14)',
  },
  ocean: {
    name: 'Samsung Ocean Blue',
    primary: '#3B82F6',
    secondary: '#6366F1',
    glow: 'rgba(59, 130, 246, 0.25)',
    softBg: 'rgba(59, 130, 246, 0.14)',
  },
  gold: {
    name: 'Oro Ejecutivo (Negocio)',
    primary: '#F59E0B',
    secondary: '#14B8A6',
    glow: 'rgba(245, 158, 11, 0.25)',
    softBg: 'rgba(245, 158, 11, 0.14)',
  },
  amethyst: {
    name: 'Amatista Real',
    primary: '#8B5CF6',
    secondary: '#EC4899',
    glow: 'rgba(139, 92, 246, 0.25)',
    softBg: 'rgba(139, 92, 246, 0.14)',
  },
  coral: {
    name: 'Coral Sunset',
    primary: '#F43F5E',
    secondary: '#FB923C',
    glow: 'rgba(244, 63, 94, 0.25)',
    softBg: 'rgba(244, 63, 94, 0.14)',
  },
};

export const SURFACE_PALETTES: Record<
  ThemeMode,
  {
    name: string;
    background: string;
    surface1: string;
    surface2: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    danger: string;
    warning: string;
    success: string;
  }
> = {
  dark: {
    name: 'Oscuro Obsidiana',
    background: '#0B0F19',
    surface1: '#131A2A',
    surface2: '#1C2539',
    border: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
  },
  amoled: {
    name: 'Negro Puro AMOLED',
    background: '#000000',
    surface1: '#0D1117',
    surface2: '#161B22',
    border: 'rgba(255, 255, 255, 0.10)',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textMuted: '#6B7280',
    danger: '#F87171',
    warning: '#FBBF24',
    success: '#34D399',
  },
  light: {
    name: 'Claro Alabastro (One UI)',
    background: '#F4F6FA',
    surface1: '#FFFFFF',
    surface2: '#EBF0F7',
    border: 'rgba(15, 23, 42, 0.08)',
    textPrimary: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    danger: '#DC2626',
    warning: '#D97706',
    success: '#059669',
  },
};

export const CURRENCIES: Record<CurrencyCode, { symbol: string; name: string; defaultRateToUSD: number }> = {
  HNL: { symbol: 'L', name: 'Lempira Hondureño', defaultRateToUSD: 25.0 },
  USD: { symbol: '$', name: 'Dólar Estadounidense', defaultRateToUSD: 1.0 },
  EUR: { symbol: '€', name: 'Euro', defaultRateToUSD: 0.92 },
  MXN: { symbol: 'MX$', name: 'Peso Mexicano', defaultRateToUSD: 19.8 },
};

export const FONT_FAMILIES: Record<FontFamilyKey, { label: string; description: string; cssFont: string }> = {
  jakarta: {
    label: 'Plus Jakarta Sans',
    description: 'Geométrica, moderna y cálida (One UI)',
    cssFont: 'System',
  },
  inter: {
    label: 'Inter Banca Suiza',
    description: 'Máxima legibilidad para tablas densas',
    cssFont: 'System',
  },
  space_grotesk: {
    label: 'Space Grotesk Analítica',
    description: 'Estilo técnico y cuantitativo',
    cssFont: 'monospace',
  },
};

export function formatMoney(amount: number, currency: string = 'HNL', hideBalance: boolean = false): string {
  if (hideBalance) {
    const sym = CURRENCIES[currency as CurrencyCode]?.symbol || currency;
    return `${sym} ••••••`;
  }
  const sym = CURRENCIES[currency as CurrencyCode]?.symbol || currency;
  const formatted = Number(amount || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${sym} ${formatted}`;
}
