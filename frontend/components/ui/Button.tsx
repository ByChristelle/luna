import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { COLORS } from '../../constants/theme';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export default function Button({ title, loading, style, disabled, ...props }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled || loading ? styles.disabled : null, style]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.surface} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  disabled: { 
    backgroundColor: COLORS.primaryLight,
    opacity: 0.7,
  },
  text: { 
    color: COLORS.surface, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});