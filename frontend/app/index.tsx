import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/authStore';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../constants/theme';
import Logo from '../components/ui/Logo';
import PublicNavbar from '../components/ui/PublicNavbar';
import { Stack } from 'expo-router';

const { height } = Dimensions.get('window');

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const { token } = useAuthStore();

  useEffect(() => {
    const checkAndRedirect = async () => {
      if (token) {
        const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (hasCompleted === 'true') {
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)/onboarding');
        }
      }
    };
    checkAndRedirect();
  }, [token]);

  // Loader pendant la vérification du token
  if (token === undefined) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Page publique
  if (!token) {
    return (
      <ImageBackground
        source={require('../assets/images/backgrounds/public.jpg')}
        style={styles.bg}
        resizeMode="cover"
      >
        {/* Overlay sombre pour lisibilité */}
        <View style={styles.overlay} />

        {/* Masquer le header natif */}
        <Stack.Screen options={{ headerShown: false }} />

        {/* Navbar */}
        <PublicNavbar currentPage="home" />

        <SafeAreaView style={styles.safe} edges={['bottom']}>
          <View style={styles.container}>

            {/* ===== HAUT : Titre ===== */}
            <View style={styles.topSection}>
              <Text style={styles.brandName}>Luna</Text>
              <Text style={styles.slogan}>Ton compagnon bienveillant</Text>
              <Text style={styles.sloganSub}>
                Comprends, suis et célèbre{'\n'}ton cycle féminin.
              </Text>
            </View>

            {/* ===== BAS : Boutons ===== */}
            <View style={styles.bottomSection}>
              <Pressable
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.btnPrimaryText}>🌸 Commencer mon suivi</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.btnSecondary, pressed && styles.pressed]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.btnSecondaryText}>J'ai déjà un compte</Text>
              </Pressable>

              <Text style={styles.footer}>Fait avec 💕 par l'équipe Luna</Text>
            </View>

          </View>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={COLORS.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  safe: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 20,
    paddingBottom: 40,
  },
  topSection: {
    alignItems: 'center',
    marginTop: 20,
    paddingRight:100,
  },
  logoWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    
  },
  brandName: {
    fontSize: 52,
    fontFamily: FONTS.script,
    color: '#FFFFFF',
    marginTop: 8,
    letterSpacing: 2,
  },
  slogan: {
    fontSize: 20,
    fontFamily: FONTS.script,
    color: COLORS.primaryLight,
    marginTop: 4,
    textAlign: 'center',
  },
  sloganSub: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomSection: {
    alignItems: 'center',
    gap: 12,
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnPrimaryText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: '#FFFFFF',
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  btnSecondaryText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.8,
  },
  footer: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#FFFFFF',
    marginTop: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
});
