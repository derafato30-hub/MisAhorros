# 03. Estándares de UI/UX y Motor de Animaciones Calidad Samsung One UI — MisAhorros

> [!TIP]
> **Filosofía de Diseño**: `MisAhorros` combina la ergonomía de una sola mano y las físicas fluidas de **Samsung One UI 6/7** con la estética limpia de las mejores FinTech globales. Cada toque debe sentirse vivo, elástico, ininterrumpible y ejecutándose a **60/120 FPS en el hilo nativo (UI Thread)** mediante `react-native-reanimated` v3 y `react-native-gesture-handler`.

---

## 1. Ergonomía Samsung One UI (Reachability & Layout)

1. **Principio de División 30/70 (Viewing Area vs. Interaction Area)**:
   - **Zona Superior (30% - Área de Visualización)**: Títulos grandes de contexto, Balance Total consolidado, selector de perfil (`Personal` | `Mi Negocio`), que se colapsa suavemente en una barra compacta al hacer scroll hacia abajo (`Collapsible Header` con interpolación en Reanimated).
   - **Zona Inferior (70% - Área de Interacción de Pulgar)**: Todos los controles accionables frecuentes (pills de cuentas, botones de registro rápido, pestañas, tarjetas interactivas y barra de navegación flotante) se ubican al alcance natural del pulgar sin estirar la mano.
2. **Geometría Squircle (Curvatura Continua)**:
   - Tarjetas principales y contenedores de sección: `borderRadius: 28` con `borderCurve: 'continuous'`.
   - Tarjetas secundarias e ítems de lista agrupados: `borderRadius: 20`.
   - Botones, chips y píldoras: `borderRadius: 9999` (cápsula completa).

---

## 2. Física de Animaciones (Samsung One UI Spring Physics)

**PROHIBIDO** usar animaciones lineales bruscas o el API antiguo `Animated` de React Native en el hilo JS. Todas las transiciones deben usar `react-native-reanimated` con físicas de resorte (`withSpring`) sin rebote excesivo (amortiguación crítica/suave estilo Samsung):

### 2.1 Parámetros Oficiales de Resorte (Tokens de Animación)
```typescript
export const SAMSUNG_SPRING = {
  // Para transiciones de tarjetas, modales, bottom sheets y cambio de perfil
  snappy: {
    damping: 24,
    stiffness: 260,
    mass: 0.9,
  },
  // Para expansión de listas, barras de progreso y gráficos financieros
  smooth: {
    damping: 28,
    stiffness: 180,
    mass: 1.0,
  },
  // Micro-interacción táctil al presionar cualquier tarjeta o botón (Scale 0.96)
  pressIn: {
    damping: 20,
    stiffness: 350,
    mass: 0.7,
  },
};
```

### 2.2 Catálogo de Micro-Interacciones Obligatorias
1. **Tap Feedback con Respuesta Háptica (`PressableScale`)**:
   - Al tocar cualquier tarjeta bancaria, categoría o botón, se reduce su escala a `0.96` con `withSpring` y se dispara un feedback háptico sutil vía `expo-haptics` (`Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`).
2. **Odómetro Numérico Animado (`AnimatedRollingNumber`)**:
   - Cuando cambia el Balance Total (por registrar un gasto, cambiar de `Personal` a `Mi Negocio`, o alternar entre `HNL` y `USD`), los dígitos ruedan verticalmente con suavidad en lugar de cambiar de golpe.
3. **Carrusel 3D con Paralaje para Tarjetas de Crédito**:
   - Al deslizar horizontalmente entre tarjetas de crédito (`Visa`, `Mastercard`, `Amex`), las tarjetas laterales rotan ligeramente e interpolan su escala (`0.90 -> 1.0 -> 0.90`) y opacidad (`0.6 -> 1.0 -> 0.6`), mostrando un destello sutil sobre el chip metálico.
4. **Layout Animations en Listas de Movimientos**:
   - Al filtrar movimientos por cuenta o categoría, o al insertar un nuevo gasto desde el Chatbot IA, los elementos entran con `FadeInDown.springify().damping(24)` y se reordenan con `LinearTransition.springify()`.
5. **Bottom Sheets Elásticos con Blur Dinámico**:
   - El formulario de "Nuevo Movimiento" (botón central `+`), detalles de cuota de préstamo y configuración rápida se abren en un Bottom Sheet deslizable con fondo desenfocado (`BlurView`) que soporta gesto de arrastre para cerrar.

---

## 3. Motor de Personalización Total de Cuenta (Theming Engine)

El usuario puede personalizar su experiencia visual en tiempo real (guardada en su perfil de Supabase y cacheada localmente para carga instantánea):

### 3.1 Modos de Luz y Oscuridad
- **Dark Mode AMOLED / Obsidian (Por defecto)**:
  - Fondo Base: `#0B0F19` (Obsidiana Profundo) / `#000000` (Opción Negro Puro AMOLED para ahorro de batería).
  - Superficie de Tarjetas N1: `#131A2A` con borde sutil `rgba(255, 255, 255, 0.08)`.
  - Superficie Elevada N2: `#1C2539`.
- **Light Mode Alabaster**:
  - Fondo Base: `#F4F6FA` (Gris Alabastro suave que no cansa la vista, estilo One UI Light).
  - Superficie de Tarjetas N1: `#FFFFFF` con sombra difusa `rgba(15, 23, 42, 0.04)`.

### 3.2 Paletas de Colores Base Personalizables (Accent Themes)
El usuario puede elegir su color acento favorito en Configuración, y el perfil `Mi Negocio` cambia automáticamente a un tono distintivo para que el usuario siempre sepa en qué entorno está operando:
1. **Emerald Wealth (Clásico FinTech)**: `#10B981` (Esmeralda) + `#06B6D4` (Cian).
2. **Samsung Ocean Blue**: `#3B82F6` (Azul Eléctrico) + `#6366F1` (Índigo).
3. **Executive Gold (Predeterminado en modo Mi Negocio)**: `#F59E0B` (Ámbar Dorado) + `#14B8A6` (Teal).
4. **Royal Amethyst**: `#8B5CF6` (Violeta Real) + `#EC4899` (Magenta).
5. **Sunset Coral**: `#F43F5E` (Coral) + `#FB923C` (Naranja).

### 3.3 Selector de Tipografías (Fuentes)
El usuario puede alternar entre 3 familias tipográficas pre-cargadas con `expo-font`:
1. **Plus Jakarta Sans** (Moderna, geométrica y amigable — Predeterminada).
2. **Inter** (Ultra-legible, neutra estilo bancario suizo).
3. **Space Grotesk / JetBrains Mono** (Para usuarios analíticos; todos los montos numéricos aplican siempre `fontVariant: ['tabular-nums']` para que las columnas de centavos jamás se desalineen).
