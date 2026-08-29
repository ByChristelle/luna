import { useState } from 'react';
import { TextInput, StyleSheet, Text, View, TextInputProps, Platform } from 'react-native';
import { COLORS } from '../../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
        placeholderTextColor={COLORS.textMuted}
        onFocus={(e) => {
          setIsFocused(true);
          if (onFocus) onFocus(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          if (onBlur) onBlur(e);
        }}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    width: '100%', 
    marginBottom: 15 
  },
  label: { 
    marginBottom: 5, 
    fontSize: 14, 
    fontWeight: '600', 
    color: COLORS.textMain 
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.textMain,
    // Retire l'outline bleu par défaut des navigateurs web
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      },
    }),
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: { 
    borderColor: COLORS.primaryDark,
  },
  errorText: { 
    marginTop: 4, 
    fontSize: 12, 
    color: COLORS.primaryDark 
  },
});