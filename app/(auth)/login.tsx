import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowRight,
  Briefcase,
  Check,
  Lock,
  Mail,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react-native';
import { supabase } from '../../src/lib/supabase';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { PressableScale } from '../../src/components/ui/PressableScale';
import { CURRENCIES, CurrencyCode } from '../../src/theme/samsungOneUI';
import { useAppStore } from '../../src/store/useAppStore';

export default function LoginScreen() {
  const theme = useSamsungTheme();
  const updatePreferences = useAppStore((s) => s.updatePreferences);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('HNL');
  const [isSalaried, setIsSalaried] = useState(true);
  const [hasBusiness, setHasBusiness] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    if (!email.trim() || !password.trim()) {
      setMessage({ type: 'error', text: 'Por favor ingresa tu correo y contraseña.' });
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim() || 'Usuario MisAhorros',
            },
          },
        });
        if (error) throw error;

        if (data.user) {
          await updatePreferences({
            full_name: fullName.trim() || 'Usuario MisAhorros',
            default_currency: defaultCurrency,
            is_salaried: isSalaried,
            has_business: hasBusiness,
            onboarding_completed: true,
          });
        }

        if (!data.session) {
          setMessage({
            type: 'success',
            text: '¡Cuenta creada! Revisa tu correo para confirmar o inicia sesión directamente.',
          });
        }
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err?.message || 'Ocurrió un error al autenticar con Supabase.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: theme.surface.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Zona Superior 30% - Ergonomía Samsung One UI */}
        <View style={styles.heroArea}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: theme.accent.softBg,
                borderColor: theme.accent.primary,
              },
            ]}
          >
            <Wallet size={34} color={theme.accent.primary} />
          </View>
          <Text style={[styles.appTitle, { color: theme.surface.textPrimary }]}>
            MisAhorros
          </Text>
          <Text style={[styles.appSubtitle, { color: theme.surface.textSecondary }]}>
            Inteligencia Financiera Personal y de Negocios
          </Text>
        </View>

        {/* Tarjeta Squircle Principal (Zona de Interacción 70%) */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.surface.surface1,
              borderColor: theme.surface.border,
            },
          ]}
        >
          {/* Selector Login / Registro */}
          <View
            style={[
              styles.segmentedControl,
              { backgroundColor: theme.surface.background, borderColor: theme.surface.border },
            ]}
          >
            <PressableScale
              onPress={() => {
                setMode('login');
                setMessage(null);
              }}
              style={[
                styles.segmentButton,
                mode === 'login' && { backgroundColor: theme.accent.primary },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: mode === 'login' ? '#0B0F19' : theme.surface.textSecondary },
                ]}
              >
                Iniciar Sesión
              </Text>
            </PressableScale>

            <PressableScale
              onPress={() => {
                setMode('register');
                setMessage(null);
              }}
              style={[
                styles.segmentButton,
                mode === 'register' && { backgroundColor: theme.accent.primary },
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: mode === 'register' ? '#0B0F19' : theme.surface.textSecondary },
                ]}
              >
                Crear Cuenta
              </Text>
            </PressableScale>
          </View>

          {mode === 'register' && (
            <View style={styles.fieldGroup}>
              <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                Nombre Completo
              </Text>
              <View
                style={[
                  styles.inputRow,
                  { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
                ]}
              >
                <User size={18} color={theme.surface.textSecondary} />
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ej. Elmer Merino"
                  placeholderTextColor={theme.surface.textMuted}
                  style={[styles.input, { color: theme.surface.textPrimary }]}
                />
              </View>
            </View>
          )}

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
              Correo Electrónico
            </Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
              ]}
            >
              <Mail size={18} color={theme.surface.textSecondary} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="tu@correo.com"
                placeholderTextColor={theme.surface.textMuted}
                style={[styles.input, { color: theme.surface.textPrimary }]}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
              Contraseña Segura
            </Text>
            <View
              style={[
                styles.inputRow,
                { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
              ]}
            >
              <Lock size={18} color={theme.surface.textSecondary} />
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={theme.surface.textMuted}
                style={[styles.input, { color: theme.surface.textPrimary }]}
              />
            </View>
          </View>

          {/* Opciones de Personalización Inicial al Registrarse */}
          {mode === 'register' && (
            <View style={styles.onboardingBox}>
              <Text style={[styles.sectionTitle, { color: theme.surface.textPrimary }]}>
                Configuración Inicial de tu Perfil
              </Text>

              <Text style={[styles.label, { color: theme.surface.textSecondary }]}>
                Moneda Base Principal
              </Text>
              <View style={styles.currencyRow}>
                {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => {
                  const selected = defaultCurrency === code;
                  return (
                    <PressableScale
                      key={code}
                      onPress={() => setDefaultCurrency(code)}
                      style={[
                        styles.currencyPill,
                        {
                          backgroundColor: selected
                            ? theme.accent.softBg
                            : theme.surface.surface2,
                          borderColor: selected ? theme.accent.primary : theme.surface.border,
                        },
                      ]}
                    >
                      <Text
                        style={{
                          color: selected ? theme.accent.primary : theme.surface.textSecondary,
                          fontWeight: '700',
                          fontSize: 13,
                        }}
                      >
                        {CURRENCIES[code].symbol} {code}
                      </Text>
                    </PressableScale>
                  );
                })}
              </View>

              <PressableScale
                onPress={() => setIsSalaried(!isSalaried)}
                style={[
                  styles.toggleOption,
                  {
                    backgroundColor: theme.surface.surface2,
                    borderColor: isSalaried ? theme.accent.primary : theme.surface.border,
                  },
                ]}
              >
                <View style={styles.toggleInfo}>
                  <Sparkles size={18} color={theme.accent.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.surface.textPrimary }]}>
                      Recibo Ingresos por Nómina / Salario
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.surface.textSecondary }]}>
                      Activa recordatorios quincenales/mensuales de planilla
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    {
                      backgroundColor: isSalaried ? theme.accent.primary : 'transparent',
                      borderColor: isSalaried ? theme.accent.primary : theme.surface.textMuted,
                    },
                  ]}
                >
                  {isSalaried && <Check size={14} color="#0B0F19" />}
                </View>
              </PressableScale>

              <PressableScale
                onPress={() => setHasBusiness(!hasBusiness)}
                style={[
                  styles.toggleOption,
                  {
                    backgroundColor: theme.surface.surface2,
                    borderColor: hasBusiness ? theme.accent.primary : theme.surface.border,
                  },
                ]}
              >
                <View style={styles.toggleInfo}>
                  <Briefcase size={18} color={theme.accent.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.toggleTitle, { color: theme.surface.textPrimary }]}>
                      Tengo un Negocio / Emprendimiento
                    </Text>
                    <Text style={[styles.toggleSub, { color: theme.surface.textSecondary }]}>
                      Habilita contabilidad básica separada ("Mi Negocio")
                    </Text>
                  </View>
                </View>
                <View
                  style={[
                    styles.checkCircle,
                    {
                      backgroundColor: hasBusiness ? theme.accent.primary : 'transparent',
                      borderColor: hasBusiness ? theme.accent.primary : theme.surface.textMuted,
                    },
                  ]}
                >
                  {hasBusiness && <Check size={14} color="#0B0F19" />}
                </View>
              </PressableScale>
            </View>
          )}

          {message && (
            <View
              style={[
                styles.alertBox,
                {
                  backgroundColor:
                    message.type === 'error'
                      ? 'rgba(239, 68, 68, 0.14)'
                      : 'rgba(16, 185, 129, 0.14)',
                  borderColor:
                    message.type === 'error' ? theme.surface.danger : theme.surface.success,
                },
              ]}
            >
              <Text
                style={{
                  color: message.type === 'error' ? theme.surface.danger : theme.surface.success,
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {message.text}
              </Text>
            </View>
          )}

          <PressableScale
            disabled={loading}
            onPress={handleSubmit}
            style={[styles.primaryBtn, { backgroundColor: theme.accent.primary }]}
          >
            {loading ? (
              <ActivityIndicator color="#0B0F19" />
            ) : (
              <>
                <Text style={styles.primaryBtnText}>
                  {mode === 'login' ? 'Entrar a MisAhorros' : 'Crear Cuenta y Configurar'}
                </Text>
                <ArrowRight size={18} color="#0B0F19" />
              </>
            )}
          </PressableScale>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
  },
  heroArea: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 26,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  card: {
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    gap: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9999,
    alignItems: 'center',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    height: 50,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  onboardingBox: {
    gap: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  currencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  currencyPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 9999,
    borderWidth: 1,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertBox: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  primaryBtn: {
    height: 54,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#0B0F19',
    fontSize: 15,
    fontWeight: '800',
  },
});
