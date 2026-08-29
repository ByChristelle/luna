import { useState } from 'react';
import { View, Text, StyleSheet, Pressable , ScrollView} from 'react-native';
import { useRouter } from 'expo-router';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { useAuthStore } from '../stores/authStore';
import { COLORS, FONTS } from '../constants/theme';
import Logo  from '../components/ui/Logo'


export default function RegisterScreen() {
  const router = useRouter();
  const { register, loading, error } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleRegister = async () => {
    setFormError('');
    if (!name || !email || !password) {
      setFormError('Veuillez remplir tous les champs.');
      return;
    }

    const result = await register({ name, email, password });
    if (result.success) {
      router.push('/login');
    }
  };

  return (

     <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
    <View style={styles.container}>
      {/* Utilisation de Sacramento pour le logo/marque */}
      <Logo size={120}/>
      <Text style={styles.brandTitle}>Luna</Text>
      
      {/* Utilisation de Poppins-Bold pour le titre de page */}
      <Text style={styles.title}>Inscription</Text>

      <Alert message={formError || error || ''} type="error" />

      <Input 
        label="Nom complet" 
        placeholder="John Doe" 
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

      <Button title="S'inscrire" onPress={handleRegister} loading={loading} />

      <Pressable onPress={() => router.push('/login')}>
        {/* Utilisation de Poppins-Medium pour le lien */}
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </Pressable>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    padding: 20, 
    backgroundColor: COLORS.background 
  },
  brandTitle: {
    fontFamily: FONTS.script,
    fontSize: 48,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 5,
  },
  title: { 
    fontFamily: FONTS.bold,
    fontSize: 22, 
    color: COLORS.textMain,
    marginBottom: 20, 
    textAlign: 'center' 
  },
  link: { 
    fontFamily: FONTS.medium,
    fontSize: 14,
    marginTop: 20, 
    color: COLORS.primary, 
    textAlign: 'center',
  },
  scrollContent: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    paddingVertical: 10 
  },
});