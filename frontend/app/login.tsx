import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuthStore } from '../stores/authStore';
import { COLORS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function LoginScreen() {
  const router = useRouter();
  const { login, setToken, loading, error } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');


  // Fonction pour rediriger selon le statut d'onboarding
  const navigateAfterAuth = async () => {
    try {
      const hasCompleted = await AsyncStorage.getItem('hasCompletedOnboarding');
      if (hasCompleted === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (err) {
      router.replace('/onboarding');
    }
  };
  // Interception du retour Google via l'URL
  useEffect(() => {
    const handleUrlChange = async (url: string | null) => {
      if (!url) return;
      
      // Récupère le token injecté par FastAPI dans l'URL
      if (url.includes('token=')) {
        const token = url.split('token=')[1]?.split('&')[0];
        if (token) {
          await setToken(token);
          await navigateAfterAuth();
        }
      }
    };

    // Écoute les redirections lorsque l'application est déjà ouverte
    const subscription = Linking.addEventListener('url', (event) => {
      handleUrlChange(event.url);
    });

    // Vérifie l'URL de lancement au cas où l'app s'ouvre depuis le navigateur
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
      await navigateAfterAuth();
    }
  };

  const loginWithGoogle = () => {
    Linking.openURL('http://localhost:8000/api/auth/google/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

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

      <View style={styles.googleContainer}>
        <Button 
          title="Continuer avec Google" 
          onPress={loginWithGoogle} 
        />
      </View>

      <Pressable onPress={() => router.push('/register')}>
        <Text style={styles.link}>Pas encore de compte ? S'inscrire</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textMain,
    textAlign: 'center',
    marginBottom: 20,
  },
  googleContainer: {
    marginTop: 15,
  },
  link: {
    marginTop: 20,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
});