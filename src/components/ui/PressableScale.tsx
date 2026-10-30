import React from 'react';
import { Platform, Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { SAMSUNG_SPRING } from '../../theme/samsungOneUI';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface PressableScaleProps {
  children?: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
}

/**
 * Componente con física de resorte Samsung One UI (60/120 FPS en hilo nativo)
 * + retroalimentación háptica sutil en dispositivos móviles.
 */
export const PressableScale: React.FC<PressableScaleProps> = ({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled) return;
    scale.value = withSpring(scaleTo, SAMSUNG_SPRING.pressIn);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, SAMSUNG_SPRING.snappy);
  };

  return (
    <AnimatedPressable
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[style, animatedStyle]}
    >
      {children}
    </AnimatedPressable>
  );
};
