// 1. Importer useGlobalSearchParams au lieu de useLocalSearchParams
import { Tabs, useRouter, useGlobalSearchParams } from 'expo-router';
import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import { COLORS } from '../../constants/theme';

export default function TabLayout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);

  // 2. Récupérer le token de façon globale dans l'URL
  const { token } = useGlobalSearchParams<{ token?: string }>();
  const isGuest = Boolean(token);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.textMain,
        headerRight: isGuest
          ? undefined
          : () => (
              <Pressable onPress={handleLogout} style={styles.logoutButton}>
                <Text style={styles.logoutText}>Déconnexion</Text>
              </Pressable>
            ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'index') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'ai') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          }

          const iconColor = route.name === 'ai' && focused ? COLORS.ai : color;

          return <Ionicons name={iconName} size={size} color={iconColor} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: isGuest
          ? { display: 'none' }
          : {
              backgroundColor: COLORS.surface,
              borderTopColor: COLORS.border,
              paddingBottom: 5,
              height: 60,
            },
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: isGuest ? 'Aperçu du cycle' : 'Accueil',
          headerTitleStyle: {
            color: COLORS.textMain,
            fontSize: 18,
            fontWeight: 'bold',
          },
          tabBarLabelStyle: {
            fontSize: 12,
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          href: isGuest ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          href: isGuest ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Luna AI',
          tabBarActiveTintColor: COLORS.ai,
          href: isGuest ? null : undefined,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  logoutText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
});