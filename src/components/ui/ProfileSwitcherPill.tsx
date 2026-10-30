import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Briefcase, User } from 'lucide-react-native';
import { useAppStore } from '../../store/useAppStore';
import { useSamsungTheme } from '../../theme/useSamsungTheme';
import { PressableScale } from './PressableScale';

/**
 * Interruptor superior estilo Samsung One UI que permite cambiar al instante
 * entre "Finanzas Personales" y "Mi Negocio".
 */
export const ProfileSwitcherPill: React.FC = () => {
  const activeProfileType = useAppStore((s) => s.activeProfileType);
  const setActiveProfileType = useAppStore((s) => s.setActiveProfileType);
  const hasBusiness = useAppStore((s) => s.preferences.has_business);
  const theme = useSamsungTheme();

  if (!hasBusiness) {
    return (
      <View
        style={[
          styles.singleBadge,
          { backgroundColor: theme.surface.surface1, borderColor: theme.surface.border },
        ]}
      >
        <User size={15} color={theme.accent.primary} />
        <Text style={[styles.badgeText, { color: theme.surface.textPrimary }]}>
          Finanzas Personales
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surface.surface1,
          borderColor: theme.surface.border,
        },
      ]}
    >
      <PressableScale
        scaleTo={0.95}
        onPress={() => setActiveProfileType('personal')}
        style={[
          styles.tab,
          activeProfileType === 'personal' && {
            backgroundColor: theme.accent.softBg,
            borderColor: theme.accent.primary,
            borderWidth: 1,
          },
        ]}
      >
        <User
          size={15}
          color={
            activeProfileType === 'personal'
              ? theme.accent.primary
              : theme.surface.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeProfileType === 'personal'
                  ? theme.surface.textPrimary
                  : theme.surface.textSecondary,
              fontFamily: theme.font.cssFont,
            },
          ]}
        >
          Personal
        </Text>
      </PressableScale>

      <PressableScale
        scaleTo={0.95}
        onPress={() => setActiveProfileType('business')}
        style={[
          styles.tab,
          activeProfileType === 'business' && {
            backgroundColor: theme.accent.softBg,
            borderColor: theme.accent.primary,
            borderWidth: 1,
          },
        ]}
      >
        <Briefcase
          size={15}
          color={
            activeProfileType === 'business'
              ? theme.accent.primary
              : theme.surface.textSecondary
          }
        />
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeProfileType === 'business'
                  ? theme.surface.textPrimary
                  : theme.surface.textSecondary,
              fontFamily: theme.font.cssFont,
            },
          ]}
        >
          Mi Negocio
        </Text>
      </PressableScale>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 9999,
    padding: 4,
    borderWidth: 1,
    alignSelf: 'center',
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 9999,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  singleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 9999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
