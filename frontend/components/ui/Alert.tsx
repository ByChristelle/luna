import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
}

export default function Alert({ message, type = 'error' }: AlertProps) {
  if (!message) return null;

  return (
    <View style={[styles.container, styles[type]]}>
      <Text style={[styles.text, styles[`${type}Text`]]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  // Erreur (utilise primary / primaryLight)
  error: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  errorText: {
    color: COLORS.primaryDark,
  },
  // Succès
  success: {
    backgroundColor: '#E8F5E9',
    borderColor: COLORS.success,
  },
  successText: {
    color: '#2E7D32',
  },
  // Avertissement
  warning: {
    backgroundColor: '#FFF3E0',
    borderColor: COLORS.warning,
  },
  warningText: {
    color: '#E65100',
  },
  // Info (IA)
  info: {
    backgroundColor: '#F3E5F5',
    borderColor: COLORS.ai,
  },
  infoText: {
    color: COLORS.ai,
  },
});