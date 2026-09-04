import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Configuration de l'affichage des notifications quand l'app est ouverte
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Demande la permission et retourne le push token de l'appareil
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Les notifications push ne fonctionnent pas sur émulateur
  if (!Device.isDevice) {
    console.warn('[notifications] Les notifications push nécessitent un vrai appareil.');
    return null;
  }

  // Vérifier la permission actuelle
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Demander la permission si pas encore accordée
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[notifications] Permission refusée.');
    return null;
  }

  // Récupérer le push token Expo
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: '8fb47a48-0e07-435d-8293-0813ba1f9128',
  });

  // Configuration spécifique Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('luna-default', {
      name: 'Luna Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#E85A71',
    });
  }

  console.log('[notifications] Push token:', tokenData.token);
  return tokenData.token;
}
