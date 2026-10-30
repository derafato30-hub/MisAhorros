import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  ACCENT_PALETTES,
  FONT_FAMILIES,
  SURFACE_PALETTES,
} from './samsungOneUI';

export function useSamsungTheme() {
  const preferences = useAppStore((s) => s.preferences);
  const activeProfileType = useAppStore((s) => s.activeProfileType);

  return useMemo(() => {
    const surface = SURFACE_PALETTES[preferences.theme_mode] || SURFACE_PALETTES.dark;
    // Si el usuario cambia al perfil 'business' (Mi Negocio), usamos un acento dorado/ejecutivo distintivo
    // a menos que él haya elegido otro explícitamente.
    const effectiveAccentKey =
      activeProfileType === 'business' && preferences.accent_color === 'emerald'
        ? 'gold'
        : preferences.accent_color;
    const accent = ACCENT_PALETTES[effectiveAccentKey] || ACCENT_PALETTES.emerald;
    const font = FONT_FAMILIES[preferences.font_family] || FONT_FAMILIES.jakarta;

    return {
      mode: preferences.theme_mode,
      surface,
      accent,
      font,
      activeProfileType,
      radius: {
        squircleLg: 28,
        squircleMd: 20,
        squircleSm: 14,
        pill: 9999,
      },
    };
  }, [preferences.theme_mode, preferences.accent_color, preferences.font_family, activeProfileType]);
}
