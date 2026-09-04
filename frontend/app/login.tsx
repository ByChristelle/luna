import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Logo from '../components/ui/Logo';
import PublicNavbar from '../components/ui/PublicNavbar';
import Toast from '../components/ui/Toast';
import { useAuthStore } from '../stores/authStore';
import { COLORS, FONTS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();
  const { login, setToken, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const navigateAfterAuth = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (hasCompleted === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(tabs)/onboarding');
      }
    } catch (err) {
      router.replace('/(tabs)/onboarding');
    }
  };

  useEffect(() => {
    const handleUrlChange = async (url: string | null) => {
      if (!url) return;
      if (url.includes('token=')) {
        const token = url.split('token=')[1]?.split('&')[0];
        if (token) {
          await setToken(token);
          await navigateAfterAuth();
        }
      }
    };

    const subscription = Linking.addEventListener('url', (event) => {
      handleUrlChange(event.url);
    });

    Linking.getInitialURL().then(handleUrlChange);

    return () => subscription.remove();
  }, []);

  const handleLogin = async () => {
    setFormError('');
    if (!email || !password) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }
    const result = await login({ email, password });
    if (result.success) {
      setToastVisible(true);
      setTimeout(() => navigateAfterAuth(), 1500);
    }
  };

  const loginWithGoogle = () => {
    Linking.openURL('http://localhost:8000/api/auth/google/login');
  };

  return (
    <ImageBackground
      source={require('../assets/images/backgrounds/connexion.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Toast connexion réussie */}
      <Toast
        visible={toastVisible}
        message="Connexion réussie ! Bienvenue 💕"
        type="success"
        onHide={() => setToastVisible(false)}
      />

      {/* Masquer le header natif */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navbar personnalisée */}
      <PublicNavbar currentPage="login" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Logo size={70} />
          </View>

          {/* Carte glassmorphisme */}
          <BlurView intensity={10} tint="light" style={styles.glassCard}>
            <View style={styles.cardInner}>

              <Text style={styles.title}>Connexion</Text>
              <Text style={styles.subtitle}>Connecte-toi à ton espace Luna</Text>

              <Alert message={formError || error || ''} type="error" />

              <Input
                label="Email"
                placeholder="exemple@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Input
                label="Mot de passe"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Button title="Se connecter" onPress={handleLogin} loading={loading} />

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable style={styles.googleBtn} onPress={loginWithGoogle}>
                <Ionicons name="logo-google" size={20} color={COLORS.textMain} />
                <Text style={styles.googleText}>Continuer avec Google</Text>
              </Pressable>

              <Pressable onPress={() => router.push('/register')}>
                <Text style={styles.link}>
                  Pas encore de compte ?{' '}
                  <Text style={styles.linkBold}>S'inscrire</Text>
                </Text>
              </Pressable>

            </View>
          </BlurView>

        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bg: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 24,
  },
  glassCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  cardInner: {
    padding: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
    marginBottom: 16,
  },
  googleText: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.textMain,
  },
  link: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  linkBold: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});
