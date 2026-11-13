import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  BookOpen,
  Briefcase,
  Check,
  Coins,
  Compass,
  Download,
  EyeOff,
  LogOut,
  Moon,
  Palette,
  RotateCcw,
  Sparkles,
  Sun,
  Type,
  UserCheck,
} from 'lucide-react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import {
  ACCENT_PALETTES,
  AccentColorKey,
  CURRENCIES,
  CurrencyCode,
  FONT_FAMILIES,
  FontFamilyKey,
  SURFACE_PALETTES,
  ThemeMode,
} from '../../src/theme/samsungOneUI';
import { PressableScale } from '../../src/components/ui/PressableScale';
import {
  InteractiveTutorialOverlay,
  resetAllScreenTutorials,
  SCREEN_TUTORIALS,
} from '../../src/components/ui/InteractiveTutorialModal';

export default function SettingsScreen() {
  const theme = useSamsungTheme();
  const preferences = useAppStore((s) => s.preferences);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const signOut = useAppStore((s) => s.signOut);

  const [nameInput, setNameInput] = useState(preferences.full_name || '');
  const [savedBanner, setSavedBanner] = useState(false);
  const [showManualTutorial, setShowManualTutorial] = useState(false);
  const [showFullGuideList, setShowFullGuideList] = useState(false);
  const [tutorialResetMsg, setTutorialResetMsg] = useState<string | null>(null);
  const [pwaMessage, setPwaMessage] = useState<string | null>(null);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const checkPrompt = () => {
        if ((window as any).__deferredPwaPrompt) {
          setCanInstallPwa(true);
        }
      };
      checkPrompt();
      window.addEventListener('pwa-install-available', checkPrompt);
      return () => window.removeEventListener('pwa-install-available', checkPrompt);
    }
  }, []);

  const handleSaveName = async () => {
    await updatePreferences({ full_name: nameInput.trim() || 'Usuario' });
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const handleResetTutorials = async () => {
    await resetAllScreenTutorials();
    setShowManualTutorial(true);
    setTutorialResetMsg(
      '¡Tutoriales interactivos reactivados! Se mostrarán paso a paso conforme entres a cada pestaña.'
    );
    setTimeout(() => setTutorialResetMsg(null), 4000);
  };

  const handleInstallPWA = async () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const deferredPrompt = (window as any).__deferredPwaPrompt;
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice?.outcome === 'accepted') {
          setPwaMessage('¡MisAhorros se está instalando en la pantalla de inicio de tu móvil!');
        }
        (window as any).__deferredPwaPrompt = null;
        setCanInstallPwa(false);
        return;
      }
    }

    setPwaMessage(
      '📱 Para instalar en tu teléfono: En Chrome/Edge toca el menú (⋮) arriba a la derecha y selecciona "Instalar aplicación" o "Agregar a la pantalla principal". En iPhone (Safari), toca el botón Compartir y elige "Agregar a inicio".'
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <InteractiveTutorialOverlay
        screenKey="settings"
        forceVisible={showManualTutorial}
        onClose={() => setShowManualTutorial(false)}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera con Logo Oficial de MisAhorros */}
        <View style={styles.brandRow}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.brandLogo}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.pageTitle, { color: theme.surface.textPrimary }]}>
              Perfil, Tema y Tutorial
            </Text>
            <Text style={[styles.pageSub, { color: theme.surface.textSecondary }]}>
              Personalización Samsung One UI, Guía Interactiva y App Móvil (PWA)
            </Text>
          </View>
        </View>

        {/* NUEVO: 0. Tutorial Interactivo de Funciones e Instalación de PWA */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
          ]}
        >
          <View style={styles.cardHeader}>
            <Compass size={18} color={theme.accent.primary} />
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Tutorial de Funciones y Descarga de App (PWA)
            </Text>
          </View>

          <Text style={{ color: theme.surface.textSecondary, fontSize: 13, lineHeight: 19 }}>
            Aprende a usar cada módulo paso a paso, reactiva el recorrido interactivo cuando entres a cada pantalla o descarga MisAhorros como aplicación nativa en tu celular.
          </Text>

          <View style={styles.stackList}>
            <PressableScale
              onPress={handleResetTutorials}
              style={[
                styles.actionBannerBtn,
                { backgroundColor: theme.accent.primary },
              ]}
            >
              <RotateCcw size={17} color="#0B0F19" />
              <Text style={styles.actionBannerTextDark}>
                Iniciar / Reactivar Tutorial Interactivo en Todas las Páginas
              </Text>
            </PressableScale>

            <PressableScale
              onPress={() => setShowFullGuideList(!showFullGuideList)}
              style={[
                styles.actionBannerBtn,
                {
                  backgroundColor: theme.surface.surface2,
                  borderColor: theme.accent.primary,
                  borderWidth: 1,
                },
              ]}
            >
              <BookOpen size={17} color={theme.accent.primary} />
              <Text style={[styles.actionBannerTextLight, { color: theme.surface.textPrimary }]}>
                {showFullGuideList
                  ? 'Ocultar Manual Completo de Funciones'
                  : 'Ver Manual Paso a Paso de Todas las Funciones'}
              </Text>
            </PressableScale>

            <PressableScale
              onPress={handleInstallPWA}
              style={[
                styles.actionBannerBtn,
                {
                  backgroundColor: theme.accent.softBg,
                  borderColor: theme.accent.primary,
                  borderWidth: 1,
                },
              ]}
            >
              <Download size={17} color={theme.accent.primary} />
              <Text style={[styles.actionBannerTextLight, { color: theme.accent.primary }]}>
                {canInstallPwa
                  ? '📲 Descargar e Instalar MisAhorros (PWA) Ahora'
                  : '📲 Instalar MisAhorros en mi Dispositivo Móvil (PWA)'}
              </Text>
            </PressableScale>
          </View>

          {tutorialResetMsg && (
            <View
              style={[
                styles.infoAlert,
                { backgroundColor: theme.accent.softBg, borderColor: theme.accent.primary },
              ]}
            >
              <Text style={{ color: theme.accent.primary, fontSize: 12, fontWeight: '700' }}>
                {tutorialResetMsg}
              </Text>
            </View>
          )}

          {pwaMessage && (
            <View
              style={[
                styles.infoAlert,
                { backgroundColor: theme.surface.surface2, borderColor: theme.accent.primary },
              ]}
            >
              <Text style={{ color: theme.surface.textPrimary, fontSize: 12, lineHeight: 18 }}>
                {pwaMessage}
              </Text>
            </View>
          )}

          {showFullGuideList && (
            <View style={{ gap: 10, marginTop: 6 }}>
              {Object.entries(SCREEN_TUTORIALS).map(([key, item]) => (
                <View
                  key={key}
                  style={[
                    styles.guideSectionBox,
                    {
                      backgroundColor: theme.surface.surface2,
                      borderColor: theme.surface.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: theme.accent.primary,
                      fontWeight: '800',
                      fontSize: 14,
                      marginBottom: 4,
                    }}
                  >
                    {item.screenTitle}
                  </Text>
                  {item.steps.map((st, i) => (
                    <View key={i} style={{ marginTop: 6 }}>
                      <Text
                        style={{
                          color: theme.surface.textPrimary,
                          fontWeight: '700',
                          fontSize: 13,
                        }}
                      >
                        {st.title}
                      </Text>
                      <Text
                        style={{
                          color: theme.surface.textSecondary,
                          fontSize: 12,
                          lineHeight: 17,
                        }}
                      >
                        {st.description}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* 1. Datos de Cuenta y Correo Vinculado */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <UserCheck size={18} color={theme.accent.primary} />
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Perfil Vinculado por Email
            </Text>
          </View>
          <Text style={[styles.emailBadge, { color: theme.surface.textSecondary }]}>
            {preferences.email || 'Sesión activa en Supabase'}
          </Text>

          <View style={styles.nameRow}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Tu nombre"
              placeholderTextColor={theme.surface.textMuted}
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.surface.surface2,
                  color: theme.surface.textPrimary,
                  borderColor: theme.surface.border,
                },
              ]}
            />
            <PressableScale
              onPress={handleSaveName}
              style={[styles.saveBtn, { backgroundColor: theme.accent.primary }]}
            >
              <Text style={styles.saveBtnText}>{savedBanner ? '¡Guardado!' : 'Guardar'}</Text>
            </PressableScale>
          </View>
        </View>

        {/* 2. Modo de Luz / Oscuridad (Dark / AMOLED / Light) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.cardHeader}>
            {preferences.theme_mode === 'light' ? (
              <Sun size={18} color={theme.accent.primary} />
            ) : (
              <Moon size={18} color={theme.accent.primary} />
            )}
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Modo Visual (Dark / AMOLED / Light)
            </Text>
          </View>

          <View style={styles.optionsGrid}>
            {(Object.keys(SURFACE_PALETTES) as ThemeMode[]).map((modeKey) => {
              const selected = preferences.theme_mode === modeKey;
              return (
                <PressableScale
                  key={modeKey}
                  onPress={() => updatePreferences({ theme_mode: modeKey })}
                  style={[
                    styles.modeOption,
                    {
                      backgroundColor: SURFACE_PALETTES[modeKey].background,
                      borderColor: selected ? theme.accent.primary : theme.surface.border,
                      borderWidth: selected ? 2 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: SURFACE_PALETTES[modeKey].textPrimary,
                      fontWeight: '700',
                      fontSize: 13,
                    }}
                  >
                    {SURFACE_PALETTES[modeKey].name}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* 3. Personalización de Colores Base (5 Paletas Samsung One UI) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Palette size={18} color={theme.accent.primary} />
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Color Acento Base
            </Text>
          </View>

          <View style={styles.colorSwatchesRow}>
            {(Object.keys(ACCENT_PALETTES) as AccentColorKey[]).map((colorKey) => {
              const item = ACCENT_PALETTES[colorKey];
              const selected = preferences.accent_color === colorKey;
              return (
                <PressableScale
                  key={colorKey}
                  onPress={() => updatePreferences({ accent_color: colorKey })}
                  style={[
                    styles.colorSwatchItem,
                    {
                      backgroundColor: theme.surface.surface2,
                      borderColor: selected ? item.primary : theme.surface.border,
                    },
                  ]}
                >
                  <View style={[styles.swatchDot, { backgroundColor: item.primary }]} />
                  <Text
                    style={[
                      styles.swatchLabel,
                      { color: selected ? item.primary : theme.surface.textPrimary },
                    ]}
                  >
                    {item.name}
                  </Text>
                  {selected && <Check size={15} color={item.primary} />}
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* 4. Fuentes Tipográficas */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Type size={18} color={theme.accent.primary} />
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Tipografía de la Interfaz
            </Text>
          </View>

          <View style={styles.stackList}>
            {(Object.keys(FONT_FAMILIES) as FontFamilyKey[]).map((fontKey) => {
              const f = FONT_FAMILIES[fontKey];
              const selected = preferences.font_family === fontKey;
              return (
                <PressableScale
                  key={fontKey}
                  onPress={() => updatePreferences({ font_family: fontKey })}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: theme.surface.surface2,
                      borderColor: selected ? theme.accent.primary : theme.surface.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        color: theme.surface.textPrimary,
                        fontWeight: '700',
                        fontSize: 14,
                        fontFamily: f.cssFont,
                      }}
                    >
                      {f.label}
                    </Text>
                    <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                      {f.description}
                    </Text>
                  </View>
                  {selected && <Check size={18} color={theme.accent.primary} />}
                </PressableScale>
              );
            })}
          </View>
        </View>

        {/* 5. Moneda Base y Perfil Laboral (Asalariado / Negocio) */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <Coins size={18} color={theme.accent.primary} />
            <Text style={[styles.cardTitle, { color: theme.surface.textPrimary }]}>
              Moneda Base y Modalidad Financiera
            </Text>
          </View>

          <View style={styles.currencyRow}>
            {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
              const selected = preferences.default_currency === code;
              return (
                <PressableScale
                  key={code}
                  onPress={() => updatePreferences({ default_currency: code })}
                  style={[
                    styles.currencyChip,
                    {
                      backgroundColor: selected ? theme.accent.softBg : theme.surface.surface2,
                      borderColor: selected ? theme.accent.primary : theme.surface.border,
                    },
                  ]}
                >
                  <Text
                    style={{
                      color: selected ? theme.accent.primary : theme.surface.textPrimary,
                      fontWeight: '700',
                    }}
                  >
                    {CURRENCIES[code].symbol} {code}
                  </Text>
                </PressableScale>
              );
            })}
          </View>

          <PressableScale
            onPress={() => updatePreferences({ is_salaried: !preferences.is_salaried })}
            style={[
              styles.listItem,
              {
                backgroundColor: theme.surface.surface2,
                borderColor: preferences.is_salaried
                  ? theme.accent.primary
                  : theme.surface.border,
              },
            ]}
          >
            <Sparkles size={18} color={theme.accent.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.surface.textPrimary, fontWeight: '700' }}>
                Soy Asalariado (Ingresos por Nómina)
              </Text>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                Habilita control de planilla quincenal/mensual y deducciones
              </Text>
            </View>
            {preferences.is_salaried && <Check size={18} color={theme.accent.primary} />}
          </PressableScale>

          <PressableScale
            onPress={() => updatePreferences({ has_business: !preferences.has_business })}
            style={[
              styles.listItem,
              {
                backgroundColor: theme.surface.surface2,
                borderColor: preferences.has_business
                  ? theme.accent.primary
                  : theme.surface.border,
              },
            ]}
          >
            <Briefcase size={18} color={theme.accent.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.surface.textPrimary, fontWeight: '700' }}>
                Tengo un Negocio (Contabilidad Básica)
              </Text>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                Activa el selector superior Personal ↔ Mi Negocio
              </Text>
            </View>
            {preferences.has_business && <Check size={18} color={theme.accent.primary} />}
          </PressableScale>

          <PressableScale
            onPress={() =>
              updatePreferences({
                hide_balances_default: !preferences.hide_balances_default,
              })
            }
            style={[
              styles.listItem,
              {
                backgroundColor: theme.surface.surface2,
                borderColor: preferences.hide_balances_default
                  ? theme.accent.primary
                  : theme.surface.border,
              },
            ]}
          >
            <EyeOff size={18} color={theme.accent.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.surface.textPrimary, fontWeight: '700' }}>
                Modo Discreto al Abrir la App
              </Text>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 12 }}>
                Oculta los saldos con asteriscos de forma predeterminada
              </Text>
            </View>
            {preferences.hide_balances_default && (
              <Check size={18} color={theme.accent.primary} />
            )}
          </PressableScale>
        </View>

        <PressableScale
          onPress={signOut}
          style={[
            styles.logoutBtn,
            { backgroundColor: 'rgba(239, 68, 68, 0.14)', borderColor: theme.surface.danger },
          ]}
        >
          <LogOut size={18} color={theme.surface.danger} />
          <Text style={[styles.logoutText, { color: theme.surface.danger }]}>
            Cerrar Sesión Segura
          </Text>
        </PressableScale>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 42,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 4,
  },
  brandLogo: {
    width: 54,
    height: 54,
    borderRadius: 18,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  pageSub: {
    fontSize: 12,
    marginTop: 2,
  },
  card: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  actionBannerTextDark: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 13,
  },
  actionBannerTextLight: {
    fontWeight: '800',
    fontSize: 13,
  },
  infoAlert: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  guideSectionBox: {
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
  },
  emailBadge: {
    fontSize: 13,
  },
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  nameInput: {
    flex: 1,
    height: 46,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  saveBtn: {
    paddingHorizontal: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 13,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modeOption: {
    flex: 1,
    minWidth: 100,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
    alignItems: 'center',
  },
  colorSwatchesRow: {
    gap: 8,
  },
  colorSwatchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
  },
  swatchDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
  },
  swatchLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  stackList: {
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    gap: 12,
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  logoutBtn: {
    height: 52,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
