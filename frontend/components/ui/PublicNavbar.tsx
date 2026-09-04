import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS, FONTS } from '../../constants/theme';
import Logo from './Logo';

interface PublicNavbarProps {
  currentPage?: 'login' | 'register' | 'home';
}

export default function PublicNavbar({ currentPage }: PublicNavbarProps) {
  const router = useRouter();

  return (
    <View style={styles.navbar}>
      {/* Gauche : Logo + Luna */}
      <Pressable style={styles.brand} onPress={() => router.replace('/')}>
        <Logo size={32} />
        <Text style={styles.brandName}>Luna</Text>
      </Pressable>

      {/* Droite : Accueil + Bouton */}
      <View style={styles.right}>
        {currentPage !== 'home' && (
          <Pressable onPress={() => router.replace('/')}>
            <Text style={styles.navLink}>Accueil</Text>
          </Pressable>
        )}

        {currentPage === 'home' ? (
          <>
            <Pressable
              style={styles.btnOutline}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.btnOutlineText}>Connexion</Text>
            </Pressable>
            <Pressable
              style={styles.btn}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.btnText}>S'inscrire</Text>
            </Pressable>
          </>
        ) : currentPage === 'login' ? (
          <Pressable
            style={styles.btn}
            onPress={() => router.push('/register')}
          >
            <Text style={styles.btnText}>S'inscrire</Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.btn}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.btnText}>Connexion</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontFamily: FONTS.script,
    fontSize: 26,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  navLink: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  btnText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
  btnOutline: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  btnOutlineText: {
    fontFamily: FONTS.bold,
    fontSize: 13,
    color: '#FFFFFF',
  },
});
