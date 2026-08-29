import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store'; // ou ton authStore

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams();

  useEffect(() => {
    const handleToken = async () => {

      const authToken = Array.isArray(token) ? token[0] : token;
      if (authToken) {
        // 1. Sauvegarder le token
        await SecureStore.setItemAsync('userToken', authToken);
        
        // 2. Rediriger vers l'application
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    };

    handleToken();
  }, [token]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.text}>Connexion en cours...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 10,
  },
});