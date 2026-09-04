import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, Share, ActivityIndicator, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import Toast from './Toast';
import { COLORS, FONTS } from '../../constants/theme';

interface ShareLinkModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ShareLinkModal({ visible, onClose }: ShareLinkModalProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

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
      const detail = error?.response?.data?.detail;
      const msg = detail || error?.message || "Impossible de générer le lien.";
      setErrorMsg(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!shareUrl) return;

    if (Platform.OS === 'web') {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        showToast('Lien copié dans le presse-papier !', 'success');
      } else {
        showToast(`Voici ton lien : ${shareUrl}`, 'info');
      }
      return;
    }

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

          {/* Toast à l'intérieur de la modale */}
          <Toast
            visible={toastVisible}
            message={toastMessage}
            type={toastType}
            onHide={() => setToastVisible(false)}
          />

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={24} color={COLORS.textMuted} />
          </Pressable>

          <Ionicons
            name="share-social-outline"
            size={48}
            color={COLORS.primary}
            style={{ alignSelf: 'center' }}
          />
          <Text style={styles.title}>Partager mes données</Text>
          <Text style={styles.subtitle}>
            Générez un lien d'accès en lecture seule pour votre partenaire ou votre médecin.
          </Text>

          {errorMsg && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle-outline" size={18} color={COLORS.primary} />
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFF',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'relative',
  },
  closeBtn: { alignSelf: 'flex-end' },
  title: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginTop: 12,
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginVertical: 12,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  btnText: {
    color: '#FFF',
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  linkContainer: { marginTop: 16, gap: 10 },
  linkLabel: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 12,
    fontFamily: FONTS.regular,
    color: '#444',
    textAlign: 'center',
  },
  shareBtn: {
    backgroundColor: COLORS.textMain,
    padding: 14,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: COLORS.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  errorText: {
    flex: 1,
    color: COLORS.primary,
    fontFamily: FONTS.medium,
    fontSize: 13,
  },
});
