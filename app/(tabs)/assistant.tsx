import React, { useMemo, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bot,
  CheckCircle2,
  Send,
  Sparkles,
  User,
  Wand2,
} from 'lucide-react-native';
import { useAppStore } from '../../src/store/useAppStore';
import { useSamsungTheme } from '../../src/theme/useSamsungTheme';
import { formatMoney } from '../../src/theme/samsungOneUI';
import { ProfileSwitcherPill } from '../../src/components/ui/ProfileSwitcherPill';
import { PressableScale } from '../../src/components/ui/PressableScale';

const QUICK_PROMPTS = [
  'Registra un gasto de 450 en gasolina',
  'Registra mi ingreso de nómina por 22500',
  '¿Cuál es mi resumen financiero y capacidad de ahorro?',
  'Crea un presupuesto semanal de 3500',
  'Cambia el tema a modo AMOLED',
];

export default function AssistantTabScreen() {
  const theme = useSamsungTheme();
  const preferences = useAppStore((s) => s.preferences);
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const financialProfiles = useAppStore((s) => s.financialProfiles);
  const accounts = useAppStore((s) => s.accounts);
  const creditCards = useAppStore((s) => s.creditCards);
  const categories = useAppStore((s) => s.categories);
  const budgets = useAppStore((s) => s.budgets);
  const chatMessages = useAppStore((s) => s.chatMessages);

  const registerTransaction = useAppStore((s) => s.registerTransaction);
  const createBudget = useAppStore((s) => s.createBudget);
  const updatePreferences = useAppStore((s) => s.updatePreferences);
  const addChatMessage = useAppStore((s) => s.addChatMessage);

  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);

  const activeProfile = useMemo(
    () => financialProfiles.find((p) => p.profile_type === activeProfileType),
    [financialProfiles, activeProfileType]
  );

  const profileAccounts = useMemo(
    () => (activeProfile ? accounts.filter((a) => a.profile_id === activeProfile.id) : accounts),
    [accounts, activeProfile]
  );

  const profileCategories = useMemo(
    () =>
      activeProfile ? categories.filter((c) => c.profile_id === activeProfile.id) : categories,
    [categories, activeProfile]
  );

  const totalBalance = useMemo(
    () => profileAccounts.reduce((acc, a) => acc + a.current_balance, 0),
    [profileAccounts]
  );

  /**
   * Procesador Híbrido con Function Calling:
   * - Interpreta órdenes directas para ejecutar registros reales en Supabase (gastos, nómina, presupuestos, temas).
   * - Si EXPO_PUBLIC_GEMINI_API_KEY está presente, consulta además a Gemini 2.5 Flash con el contexto financiero real.
   */
  const handleSendMessage = async (customPrompt?: string) => {
    const prompt = (customPrompt ?? inputText).trim();
    if (!prompt || processing) return;

    setInputText('');
    setProcessing(true);

    try {
      await addChatMessage({
        sender: 'user',
        message_text: prompt,
      });

      const lower = prompt.toLowerCase();
      const amountMatch = prompt.match(/(\d+(?:[.,]\d+)?)/);
      const parsedAmount = amountMatch ? parseFloat(amountMatch[1].replace(',', '')) : 0;
      const defaultAcc = profileAccounts[0];

      // 1. Detectar orden de Registro de Gasto
      if (
        (lower.includes('gasto') ||
          lower.includes('pagué') ||
          lower.includes('pague') ||
          lower.includes('compré') ||
          lower.includes('compre') ||
          (lower.includes('registra') && !lower.includes('nómina') && !lower.includes('nomina') && !lower.includes('ingreso'))) &&
        parsedAmount > 0 &&
        defaultAcc
      ) {
        const matchedCat =
          profileCategories.find(
            (c) =>
              c.category_type === 'expense' &&
              (lower.includes(c.name.toLowerCase().split(' ')[0]) ||
                (lower.includes('gasolina') && c.name.toLowerCase().includes('transporte')) ||
                (lower.includes('comida') && c.name.toLowerCase().includes('supermercado')))
          ) || profileCategories.find((c) => c.category_type === 'expense');

        await registerTransaction({
          account_id: defaultAcc.id,
          category_id: matchedCat?.id || null,
          transaction_type: 'expense',
          amount: parsedAmount,
          currency: defaultAcc.currency,
          description: prompt,
          created_by_ai: true,
        });

        await addChatMessage({
          sender: 'assistant',
          message_text: `✅ He registrado tu gasto por ${formatMoney(
            parsedAmount,
            defaultAcc.currency
          )} en la cuenta "${defaultAcc.name}" bajo la categoría "${
            matchedCat?.name || 'General'
          }". Tu nuevo saldo disponible en esa cuenta ya fue actualizado.`,
          action_payload: {
            type: 'expense_registered',
            amount: parsedAmount,
            account: defaultAcc.name,
            category: matchedCat?.name || 'General',
          },
        });
        return;
      }

      // 2. Detectar orden de Registro de Ingreso / Nómina
      if (
        (lower.includes('ingreso') ||
          lower.includes('nómina') ||
          lower.includes('nomina') ||
          lower.includes('sueldo') ||
          lower.includes('venta')) &&
        parsedAmount > 0 &&
        defaultAcc
      ) {
        const isPayroll =
          lower.includes('nómina') || lower.includes('nomina') || lower.includes('sueldo');
        await registerTransaction({
          account_id: defaultAcc.id,
          transaction_type: 'income',
          income_subtype: isPayroll ? 'payroll' : 'regular',
          amount: parsedAmount,
          currency: defaultAcc.currency,
          description: prompt,
          created_by_ai: true,
        });

        await addChatMessage({
          sender: 'assistant',
          message_text: `💰 ¡Excelente! He acreditado tu ingreso ${
            isPayroll ? 'por Nómina' : 'Regular'
          } de ${formatMoney(parsedAmount, defaultAcc.currency)} en la cuenta "${
            defaultAcc.name
          }".`,
          action_payload: {
            type: 'income_registered',
            amount: parsedAmount,
            account: defaultAcc.name,
          },
        });
        return;
      }

      // 3. Detectar orden de Crear Presupuesto
      if (lower.includes('presupuesto') && parsedAmount > 0) {
        const period = lower.includes('diario')
          ? 'daily'
          : lower.includes('semanal')
          ? 'weekly'
          : lower.includes('quincenal')
          ? 'biweekly'
          : 'monthly';

        await createBudget({
          name: `Presupuesto ${period.toUpperCase()} IA`,
          period_type: period,
          limit_amount: parsedAmount,
          currency: preferences.default_currency,
        });

        await addChatMessage({
          sender: 'assistant',
          message_text: `📊 He configurado un nuevo presupuesto (${period.toUpperCase()}) con límite de ${formatMoney(
            parsedAmount,
            preferences.default_currency
          )}. Te avisaré cuando llegues al 80% de ejecución.`,
          action_payload: {
            type: 'budget_created',
            amount: parsedAmount,
            period,
          },
        });
        return;
      }

      // 4. Detectar configuración de Tema / Moneda desde el Chatbot
      if (lower.includes('amoled') || lower.includes('modo claro') || lower.includes('modo oscuro')) {
        const newMode = lower.includes('amoled')
          ? 'amoled'
          : lower.includes('claro')
          ? 'light'
          : 'dark';
        await updatePreferences({ theme_mode: newMode });
        await addChatMessage({
          sender: 'assistant',
          message_text: `🎨 Listo, he cambiado la apariencia de MisAhorros al modo "${newMode.toUpperCase()}" con físicas Samsung One UI.`,
        });
        return;
      }

      // 5. Consulta Financiera Analítica (Usa Gemini API si hay llave o el motor financiero integrado)
      const geminiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (geminiKey) {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Eres el Asistente Financiero IA de la app MisAhorros. Contexto actual del usuario: Perfil=${activeProfileType}, Moneda=${preferences.default_currency}, Liquidez Total=${totalBalance}, Cuentas=${profileAccounts.length}, Tarjetas=${creditCards.length}, Presupuestos=${budgets.length}. Responde de forma concisa, cálida y experta a: "${prompt}"`,
                    },
                  ],
                },
              ],
            }),
          }
        );
        const data = await res.json();
        const aiReply =
          data?.candidates?.[0]?.content?.parts?.[0]?.text ||
          `Tu liquidez actual en el perfil ${activeProfileType} es de ${formatMoney(
            totalBalance,
            preferences.default_currency
          )} distribuida en ${profileAccounts.length} cuenta(s).`;

        await addChatMessage({
          sender: 'assistant',
          message_text: aiReply,
        });
      } else {
        // Respuesta experta basada en los datos reales del usuario en Supabase
        const suggestedSavings = totalBalance * 0.2;
        await addChatMessage({
          sender: 'assistant',
          message_text: `📈 Análisis de tu Perfil (${
            activeProfileType === 'business' ? 'Mi Negocio' : 'Personal'
          }):\n• Liquidez Total Disponible: ${formatMoney(
            totalBalance,
            preferences.default_currency
          )} en ${profileAccounts.length} cuenta(s).\n• Capacidad sugerida para Fondo de Ahorro / CDP (20%): ${formatMoney(
            suggestedSavings,
            preferences.default_currency
          )}.\n• También puedes pedirme: "Registra un gasto de 350 en transporte", "Registra mi nómina por 18000" o "Crea un presupuesto quincenal de 5000".`,
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.surface.background }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topContainer}>
          <ProfileSwitcherPill />
          <View style={styles.headerRow}>
            <Sparkles size={20} color={theme.accent.primary} />
            <Text style={[styles.title, { color: theme.surface.textPrimary }]}>
              Copiloto Financiero IA
            </Text>
          </View>
          <Text style={[styles.subtitle, { color: theme.surface.textSecondary }]}>
            Registra ingresos, gastos, crea presupuestos, cambia configuraciones o resuelve dudas financieras
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 && (
            <View
              style={[
                styles.welcomeCard,
                { backgroundColor: theme.surface.surface1, borderColor: theme.accent.primary },
              ]}
            >
              <Wand2 size={24} color={theme.accent.primary} />
              <Text style={[styles.welcomeTitle, { color: theme.surface.textPrimary }]}>
                ¡Hola, {preferences.full_name || 'Usuario'}! Soy tu Asistente MisAhorros
              </Text>
              <Text style={{ color: theme.surface.textSecondary, fontSize: 13, lineHeight: 19 }}>
                Puedo ejecutar registros reales en tus cuentas de Supabase y analizar tus números. Toca cualquiera de los comandos rápidos abajo o escríbeme libremente.
              </Text>
            </View>
          )}

          {chatMessages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.aiBubble,
                  {
                    backgroundColor: isUser
                      ? theme.accent.primary
                      : theme.surface.surface1,
                    borderColor: isUser ? theme.accent.primary : theme.surface.border,
                  },
                ]}
              >
                <View style={styles.bubbleHeader}>
                  {isUser ? (
                    <User size={14} color="#0B0F19" />
                  ) : (
                    <Bot size={15} color={theme.accent.primary} />
                  )}
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: isUser ? '#0B0F19' : theme.accent.primary,
                    }}
                  >
                    {isUser ? 'Tú' : 'MisAhorros IA'}
                  </Text>
                </View>

                <Text
                  style={{
                    color: isUser ? '#0B0F19' : theme.surface.textPrimary,
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: isUser ? '700' : '500',
                  }}
                >
                  {msg.message_text}
                </Text>

                {msg.action_payload && (
                  <View
                    style={[
                      styles.actionConfirmBox,
                      {
                        backgroundColor: theme.surface.surface2,
                        borderColor: theme.surface.success,
                      },
                    ]}
                  >
                    <CheckCircle2 size={16} color={theme.surface.success} />
                    <Text
                      style={{
                        color: theme.surface.textPrimary,
                        fontSize: 12,
                        fontWeight: '700',
                      }}
                    >
                      Operación sincronizada en Supabase PostgreSQL
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Chips de Comandos Rápidos */}
        <View style={styles.bottomDock}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            {QUICK_PROMPTS.map((q) => (
              <PressableScale
                key={q}
                onPress={() => handleSendMessage(q)}
                style={[
                  styles.promptChip,
                  {
                    backgroundColor: theme.surface.surface1,
                    borderColor: theme.surface.border,
                  },
                ]}
              >
                <Text style={{ color: theme.surface.textPrimary, fontSize: 12, fontWeight: '700' }}>
                  {q}
                </Text>
              </PressableScale>
            ))}
          </ScrollView>

          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: theme.surface.surface1,
                borderColor: theme.surface.border,
              },
            ]}
          >
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendMessage()}
              placeholder="Ej: Registra un gasto de 450 en gasolina..."
              placeholderTextColor={theme.surface.textMuted}
              style={[styles.chatInput, { color: theme.surface.textPrimary }]}
            />
            <PressableScale
              disabled={processing}
              onPress={() => handleSendMessage()}
              style={[styles.sendBtn, { backgroundColor: theme.accent.primary }]}
            >
              {processing ? (
                <ActivityIndicator size="small" color="#0B0F19" />
              ) : (
                <Send size={17} color="#0B0F19" />
              )}
            </PressableScale>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topContainer: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
  },
  messagesContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 12,
  },
  welcomeCard: {
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    gap: 8,
  },
  welcomeTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  messageBubble: {
    borderRadius: 22,
    padding: 15,
    borderWidth: 1,
    maxWidth: '88%',
    gap: 6,
  },
  userBubble: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 6,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 6,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionConfirmBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 4,
  },
  bottomDock: {
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 6,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    gap: 10,
  },
  chipsScroll: {
    gap: 8,
  },
  promptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
