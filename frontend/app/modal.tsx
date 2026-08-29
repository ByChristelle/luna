import { Link } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '../constants/theme';

export default function ModalScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>C'est une modale</Text>
      <Link href="/" dismissTo style={styles.link}>
        <Text style={styles.linkText}>Retourner à l'accueil</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textMain,
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
});