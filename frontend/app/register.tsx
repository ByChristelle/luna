import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Input from '../components/ui/Input';
import PublicNavbar from '../components/ui/PublicNavbar';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import Logo from '../components/ui/Logo';
import Toast from '../components/ui/Toast';
import { useAuthStore } from '../stores/authStore';
import { COLORS, FONTS } from '../constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, login, loading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword , setConfirmPassword]= useState('');
  const [formError, setFormError] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const handleRegister = async () => {
    setFormError('');

    if (!name || !email || !password || !confirmPassword) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }

    if (password.length < 8) {
      setFormError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Les mots de passe ne sont pas identiques.');
      return;
    }

    const result = await register({ name, email, password });
    if (result.success) {
      const loginResult = await login({ email, password });
      if (loginResult.success) {
        setToastVisible(true);
        setTimeout(() => router.replace('/(tabs)/onboarding'), 1800);
      }
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/backgrounds/inscription.jpg')}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* Toast inscription réussie */}
      <Toast
        visible={toastVisible}
        message="Inscription réussie ! Complétons ton profil 🌸"
        type="success"
        onHide={() => setToastVisible(false)}
      />

      {/* Masquer le header natif */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* Navbar personnalisée */}
      <PublicNavbar currentPage="register" />

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

              <Text style={styles.title}>Inscription</Text>
              <Text style={styles.subtitle}>Crée ton espace Luna personnalisé</Text>

              <Alert message={formError || error || ''} type="error" />

              <Input
                label="Nom complet"
                placeholder="Jane Doe"
                value={name}
                onChangeText={setName}
              />

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
              <Input
                label="Confirmer le mot de passe"
                placeholder="••••••••"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                // autoComplete="off"
              />

              <Button title="S'inscrire" onPress={handleRegister} loading={loading} />

              <Pressable onPress={() => router.push('/login')}>
                <Text style={styles.link}>
                  Déjà un compte ?{' '}
                  <Text style={styles.linkBold}>Se connecter</Text>
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
  link: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 16,
  },
  linkBold: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
});
