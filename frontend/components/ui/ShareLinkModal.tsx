import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Share, ActivityIndicator , Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';


interface ShareLinkModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShareLinkModal({ visible, onClose }: ShareLinkModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reset COMPLET de l'etat a CHAQUE ouverture de la modale
  // (evite de garder en cache un lien d'un autre utilisateur ou une ancienne erreur)
  useEffect(() => {
    if (visible) {
      setShareUrl(null);
      setLoading(false);
      setErrorMsg(null);
    }
  }, [visible]);

  const generateLink = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.post('/share/generate-link');
      setShareUrl(response.data.share_url);
    } catch (error: any) {
      console.error('Erreur génération lien:', error);
      const detail = error?.response?.data?.detail;
      const msg = detail || error?.message || "Impossible de générer le lien. Vérifiez que le backend est démarré et que vous avez bien complété votre profil.";
      setErrorMsg(msg);
      if (Platform.OS === 'web') {
        alert(`❌ Erreur : ${msg}`);
      } else {
        Alert.alert('Erreur', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // 2. Partager le lien avec le menu natif du téléphone
 const handleShare = async () => {
  if (!shareUrl) return;

  // 1. Sur Web : copier directement dans le presse-papier
  if (Platform.OS === 'web') {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      alert('Lien copié dans le presse-papier !');
    } else {
      alert(`Voici ton lien : ${shareUrl}`);
    }
    return;
  }

  // 2. Sur mobile (Android/iOS) : utiliser le menu de partage natif
  try {
    await Share.share({
      message: `Voici un lien sécurisé pour consulter mon suivi : ${shareUrl}`,
    });
  } catch (error) {
    console.error('Erreur partage:', error);
  }
};

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </Pressable>

          <Ionicons name="share-social-outline" size={48} color="#E85A71" style={{ alignSelf: 'center' }} />
          <Text style={styles.title}>Partager mes données</Text>
          <Text style={styles.subtitle}>
            Générez un lien d'accès en lecture seule pour votre partenaire ou votre médecin.
          </Text>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color="#E85A71" />
              <Text style={styles.errorText} numberOfLines={3}>{errorMsg}</Text>
            </View>
          )}

          {!shareUrl ? (
            <Pressable style={styles.primaryBtn} onPress={generateLink} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.btnText}>Générer un lien d'invitation</Text>
              )}
            </Pressable>
          ) : (
            <View style={styles.linkContainer}>
              <Text style={styles.linkLabel} numberOfLines={1}>{shareUrl}</Text>
              <Pressable style={styles.shareBtn} onPress={handleShare}>
                <Ionicons name="copy-outline" size={18} color="#FFF" />
                <Text style={styles.btnText}>Partager le lien</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', padding: 24, borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  closeBtn: { alignSelf: 'flex-end' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginTop: 12, color: '#2B2B2B' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginVertical: 12 },
  primaryBtn: { backgroundColor: '#E85A71', padding: 16, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  btnText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  linkContainer: { marginTop: 16, gap: 10 },
  linkLabel: { backgroundColor: '#F5F5F5', padding: 12, borderRadius: 12, color: '#444', textAlign: 'center' },
  shareBtn: { backgroundColor: '#2B2B2B', padding: 14, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FCE4E8',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: '#B33A4F',
    fontSize: 13,
    fontWeight: '500',
  },
});