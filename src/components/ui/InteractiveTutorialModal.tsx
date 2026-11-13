import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Compass,
  Download,
  Sparkles,
  X,
} from 'lucide-react-native';
import { useSamsungTheme } from '../../theme/useSamsungTheme';
import { PressableScale } from './PressableScale';

export type TutorialScreenKey =
  | 'dashboard'
  | 'accounts'
  | 'planning'
  | 'assistant'
  | 'settings';

export interface TutorialStepItem {
  title: string;
  description: string;
  actionTip: string;
}

export const SCREEN_TUTORIALS: Record<
  TutorialScreenKey,
  {
    screenTitle: string;
    subtitle: string;
    steps: TutorialStepItem[];
  }
> = {
  dashboard: {
    screenTitle: 'Bienvenido al Dashboard de MisAhorros',
    subtitle: 'Tu centro de mando financiero personal y de negocio en una sola vista',
    steps: [
      {
        title: '1. Interruptor Personal ↔ Mi Negocio',
        description:
          'En la parte superior puedes alternar en 1 toque entre tus Finanzas Personales y la contabilidad de tu Negocio sin mezclar saldos.',
        actionTip: 'Toca la píldora superior para cambiar de entorno contable.',
      },
      {
        title: '2. Balance Consolidado y Modo Discreto',
        description:
          'Muestra tu liquidez total en tu moneda base y su equivalente automático en Dólares o Lempiras.',
        actionTip: 'Toca el ícono del ojo arriba a la derecha para ocultar tus saldos en público.',
      },
      {
        title: '3. Flujo de Caja, Próximos Pagos y Consejo IA',
        description:
          'Revisa cuánto ha entrado vs. cuánto ha salido (Utilidad Neta), tus cortes próximos y recomendaciones calculadas en vivo.',
        actionTip: 'Usa los botones de acción rápida para ir directo a registrar un movimiento.',
      },
    ],
  },
  accounts: {
    screenTitle: 'Tutorial: Cuentas, Nómina, Gastos y Transferencias',
    subtitle: 'Controla de dónde sale y a dónde entra cada centavo',
    steps: [
      {
        title: '1. Crear Cuentas Multi-Moneda',
        description:
          'Puedes crear Efectivo, Banco X, Banco Y o Billeteras Digitales en HNL, USD, EUR o MXN.',
        actionTip: 'Toca "+ Nueva Cuenta" para agregar tus cuentas bancarias reales.',
      },
      {
        title: '2. Ingresos por Nómina, Regulares o Extras',
        description:
          'Acredita tu sueldo de planilla, ingresos fijos o ventas extraordinarias eligiendo a qué cuenta entran.',
        actionTip: 'Toca "+ Ingreso / Nómina" y elige la clasificación del ingreso.',
      },
      {
        title: '3. Gastos con Categorías y Filtro por Cuenta',
        description:
          'Registra gastos indicando de qué cuenta o tarjeta salió el dinero y el motivo. Si tocas una tarjeta de cuenta en la lista, filtrarás solo los movimientos de esa cuenta.',
        actionTip: 'Toca "Transferir" cuando muevas dinero de un banco a otro o hacia tu negocio.',
      },
    ],
  },
  planning: {
    screenTitle: 'Tutorial: Tarjetas, Deudas, Préstamos, Inversiones y Agenda',
    subtitle: 'Domina tus pasivos, activos e instrumentos financieros en 5 pestañas',
    steps: [
      {
        title: '1. Tarjetas de Crédito y Fechas de Corte',
        description:
          'Registra una o más tarjetas con su día de corte y día máximo de pago. El sistema separa tu Pago de Contado del saldo flotante.',
        actionTip: 'Usa el botón "Pagar Contado" para rebajar la deuda desde tu cuenta bancaria.',
      },
      {
        title: '2. Cuentas por Pagar, Cuotas e Interés por Mora',
        description:
          'Configura suscripciones (Netflix, alquiler) o deudas por cuotas (Cuota 1 de 12). Si te atrasas, calcula automáticamente el recargo moratorio.',
        actionTip: 'En la sub-pestaña "Por Pagar / Cuotas" puedes elegir la fecha exacta en que pagaste.',
      },
      {
        title: '3. Préstamos 360°, CDP/AFP, Presupuestos y Agenda',
        description:
          'Registra tanto préstamos que tú otorgas a terceros (por cobrar) como préstamos recibidos, además de Depósitos a Plazo (CDP), Fondos de Pensión, Metas de Ahorro y Presupuestos diarios/semanales/quincenales/mensuales.',
        actionTip: 'Desliza las píldoras superiores para cambiar entre Tarjetas, Cuotas, Préstamos, Ahorros y Presupuestos.',
      },
    ],
  },
  assistant: {
    screenTitle: 'Tutorial: Copiloto Financiero IA (Chatbot)',
    subtitle: 'Ejecuta registros, configuraciones y resuelve cómo usar cualquier función',
    steps: [
      {
        title: '1. Registra Movimientos Hablando o Escribiendo',
        description:
          'Solo escribe frases naturales como "Registra un gasto de 450 en gasolina" o "Registra mi ingreso de nómina por 22500" y el bot actualizará tus saldos en Supabase.',
        actionTip: 'Puedes tocar cualquiera de los chips rápidos encima de la barra de texto.',
      },
      {
        title: '2. Pregúntale Cómo Ejecutar Cualquier Acción',
        description:
          'Si tienes duda de dónde está una función, pregúntale: "¿Cómo registro una tarjeta de crédito?", "¿Cómo hago una transferencia?" o "¿Cómo creo un préstamo?" y te guiará paso a paso.',
        actionTip: 'También puedes pedirle: "Crea un presupuesto semanal de 3000" o "Cambia a modo AMOLED".',
      },
    ],
  },
  settings: {
    screenTitle: 'Tutorial: Personalización, Temas e Instalación PWA',
    subtitle: 'Adapta MisAhorros a tu estilo visual y descárgala en tu teléfono',
    steps: [
      {
        title: '1. Modo Oscuro, AMOLED, Claro, Colores y Fuentes',
        description:
          'Personaliza en vivo entre Oscuro Obsidiana, Negro Puro AMOLED o Claro Alabastro, 5 paletas de colores acento y 3 fuentes tipográficas.',
        actionTip: 'Todos tus cambios se guardan automáticamente en tu perfil en la nube.',
      },
      {
        title: '2. Instalar Aplicación Web Progresiva (PWA) y Repetir Tutorial',
        description:
          'Desde aquí puedes instalar MisAhorros directamente en la pantalla de inicio de tu celular sin ocupar espacio y reactivar los tutoriales interactivos cuando quieras.',
        actionTip: 'Usa el botón "Reiniciar Tutoriales Interactivos" para volver a ver las guías en cada pestaña.',
      },
    ],
  },
};

const STORAGE_PREFIX = 'misahorros_tutorial_seen_v1_';

export async function resetAllScreenTutorials(): Promise<void> {
  const keys: TutorialScreenKey[] = [
    'dashboard',
    'accounts',
    'planning',
    'assistant',
    'settings',
  ];
  await Promise.all(keys.map((k) => AsyncStorage.removeItem(`${STORAGE_PREFIX}${k}`)));
}

interface InteractiveTutorialOverlayProps {
  screenKey: TutorialScreenKey;
  forceVisible?: boolean;
  onClose?: () => void;
}

export const InteractiveTutorialOverlay: React.FC<InteractiveTutorialOverlayProps> = ({
  screenKey,
  forceVisible = false,
  onClose,
}) => {
  const theme = useSamsungTheme();
  const [visible, setVisible] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const tutorialData = SCREEN_TUTORIALS[screenKey];

  useEffect(() => {
    let mounted = true;
    if (forceVisible) {
      setStepIndex(0);
      setVisible(true);
      return;
    }

    AsyncStorage.getItem(`${STORAGE_PREFIX}${screenKey}`).then((seen) => {
      if (mounted && !seen) {
        setStepIndex(0);
        setVisible(true);
      }
    });

    return () => {
      mounted = false;
    };
  }, [screenKey, forceVisible]);

  const handleDismiss = async () => {
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${screenKey}`, 'true');
    setVisible(false);
    onClose?.();
  };

  const handleNext = async () => {
    if (stepIndex < tutorialData.steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      await handleDismiss();
    }
  };

  if (!visible) return null;

  const currentStep = tutorialData.steps[stepIndex];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleDismiss}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalCard,
            {
              backgroundColor: theme.surface.surface1,
              borderColor: theme.accent.primary,
            },
          ]}
        >
          <View style={styles.topBar}>
            <View style={[styles.badgePill, { backgroundColor: theme.accent.softBg }]}>
              <Compass size={15} color={theme.accent.primary} />
              <Text style={{ color: theme.accent.primary, fontWeight: '800', fontSize: 12 }}>
                Guía Interactiva • Paso {stepIndex + 1} de {tutorialData.steps.length}
              </Text>
            </View>
            <PressableScale onPress={handleDismiss}>
              <X size={20} color={theme.surface.textSecondary} />
            </PressableScale>
          </View>

          <Text style={[styles.screenTitle, { color: theme.surface.textPrimary }]}>
            {tutorialData.screenTitle}
          </Text>
          <Text style={[styles.subtitle, { color: theme.surface.textSecondary }]}>
            {tutorialData.subtitle}
          </Text>

          <View
            style={[
              styles.stepBox,
              {
                backgroundColor: theme.surface.surface2,
                borderColor: theme.surface.border,
              },
            ]}
          >
            <Text style={[styles.stepTitle, { color: theme.surface.textPrimary }]}>
              {currentStep.title}
            </Text>
            <Text style={[styles.stepDesc, { color: theme.surface.textSecondary }]}>
              {currentStep.description}
            </Text>
            <View style={[styles.tipBanner, { backgroundColor: theme.accent.softBg }]}>
              <Sparkles size={15} color={theme.accent.primary} />
              <Text
                style={{
                  color: theme.accent.primary,
                  fontSize: 12,
                  fontWeight: '700',
                  flex: 1,
                }}
              >
                Tip: {currentStep.actionTip}
              </Text>
            </View>
          </View>

          {/* Indicadores de progreso */}
          <View style={styles.dotsRow}>
            {tutorialData.steps.map((_, idx) => (
              <View
                key={idx}
                style={[
                  styles.dot,
                  {
                    width: idx === stepIndex ? 24 : 8,
                    backgroundColor:
                      idx === stepIndex ? theme.accent.primary : theme.surface.border,
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.actionsRow}>
            <PressableScale
              onPress={handleDismiss}
              style={[
                styles.skipBtn,
                { backgroundColor: theme.surface.surface2, borderColor: theme.surface.border },
              ]}
            >
              <Text style={{ color: theme.surface.textSecondary, fontWeight: '700', fontSize: 13 }}>
                Saltar guía
              </Text>
            </PressableScale>

            <PressableScale
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: theme.accent.primary }]}
            >
              <Text style={styles.nextBtnText}>
                {stepIndex < tutorialData.steps.length - 1 ? 'Siguiente' : '¡Entendido!'}
              </Text>
              {stepIndex < tutorialData.steps.length - 1 ? (
                <ArrowRight size={16} color="#0B0F19" />
              ) : (
                <CheckCircle2 size={16} color="#0B0F19" />
              )}
            </PressableScale>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(6, 10, 20, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 28,
    padding: 22,
    borderWidth: 1.5,
    gap: 14,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: -6,
  },
  stepBox: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 14,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
  },
  skipBtn: {
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 48,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextBtnText: {
    color: '#0B0F19',
    fontWeight: '800',
    fontSize: 14,
  },
});
