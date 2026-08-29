import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function ShareRedirect() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();

  useEffect(() => {
    if (token) {
      // Redirige vers / avec le token en paramètre pour qu'il soit lisible globalement
      router.replace(`/?token=${token}`);
    }
  }, [token]);

  return null;
}