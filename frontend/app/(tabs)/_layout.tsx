import { Tabs, useRouter, useGlobalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Text, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, FONTS } from '../../constants/theme';
import ConfirmModal from '../../components/ui/ConfirmModal';

export default function TabLayout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user } = useAuthStore();
  const { token } = useGlobalSearchParams<{ token?: string }>();
  const isGuest = Boolean(token);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const userName = (user as any)?.first_name
    || (user as any)?.name
    || (user as any)?.email?.split('@')[0]
    || 'Luna';

  const handleLogout = async () => {
    setShowLogoutModal(false);
    await logout();
    router.replace('/login');
  };

  const CustomHeader = () => (
    <BlurView intensity={60} tint="light" style={styles.headerBlur}>
      <View style={styles.headerInner}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.headerGreeting}>Bonjour,</Text>
            <Text style={styles.headerName}>{userName} 💕</Text>
          </View>
        </View>

        {!isGuest && (
          <Pressable onPress={() => setShowLogoutModal(true)} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={16} color={COLORS.primary} />
            <Text style={styles.logoutText}>Déconnexion</Text>
          </Pressable>
        )}
      </View>

      {/* Modal de confirmation déconnexion */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Déconnexion"
        message="Es-tu sûre de vouloir te déconnecter de ton espace Luna ?"
        confirmText="Déconnexion"
        cancelText="Rester"
        confirmColor="#E53E3E"
        icon="log-out-outline"
        iconColor="#E53E3E"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </BlurView>
  );

  return (
    <Tabs
      screenOptions={{
        header: () => <CustomHeader />,
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
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 11,
        },
      }}
    >
      {/* Suivi */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Suivi',
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={24}
              color={focused ? COLORS.primary : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Calendrier */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'calendar' : 'calendar-outline'}
              size={24}
              color={focused ? '#D98F7A' : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Profil */}
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Profil',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'person-circle' : 'person-circle-outline'}
              size={24}
              color={focused ? '#87CEEB' : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Luna AI */}
      <Tabs.Screen
        name="ai"
        options={{
          title: 'Luna AI',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'sparkles' : 'sparkles-outline'}
              size={24}
              color={focused ? COLORS.ai : COLORS.textMuted}
            />
          ),
          tabBarActiveTintColor: COLORS.ai,
        }}
      />

      {/* Alertes */}
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alertes',
          href: isGuest ? null : undefined,
          tabBarIcon: ({ focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              size={24}
              color={focused ? '#A78FB5' : COLORS.textMuted}
            />
          ),
        }}
      />

      {/* Masqués */}
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerBlur: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.3)',
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 50,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.primary,
  },
  headerGreeting: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  headerName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.textMain,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 12,
  },
});
