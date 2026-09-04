import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAiStore } from '../../stores/aiStore';
import { useCycleStore } from '../../stores/cycleStore';
import { COLORS, FONTS } from '../../constants/theme';

export default function LunaAIScreen() {
  const [prompt, setPrompt] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { messages, loading, error, fetchHistory, sendMessage } = useAiStore();
  const { data: cycleData } = useCycleStore();

  const cyclePhase = cycleData?.phase || 'folliculaire';
  const cycleDay = cycleData?.currentDay || 1;

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || loading) return;
    const text = prompt;
    setPrompt('');
    await sendMessage(text, cyclePhase, cycleDay);
  };

  const renderMessage = ({ item }: any) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.lunaBubble]}>
        {!isUser && (
          <View style={styles.lunaLabelRow}>
            <Ionicons name="sparkles" size={12} color={COLORS.ai} />
            <Text style={styles.lunaLabel}> Luna AI</Text>
          </View>
        )}
        <Text style={[styles.bubbleText, isUser ? styles.userText : styles.lunaText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* En-tête */}
      <View style={styles.header}>
        <Ionicons name="sparkles" size={20} color={COLORS.ai} />
        <Text style={styles.headerTitle}>Luna AI</Text>
        <Text style={styles.headerSub}>Ton assistante santé féminine</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.ai} style={{ opacity: 0.4 }} />
            <Text style={styles.emptyText}>Pose ta première question à Luna</Text>
            <Text style={styles.emptySubText}>Je suis là pour t'accompagner 💜</Text>
          </View>
        }
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.inputRow}>
        <TextInput
          value={prompt}
          onChangeText={setPrompt}
          placeholder="Pose une question à Luna..."
          placeholderTextColor={COLORS.textMuted}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.button, (!prompt.trim() || loading) && styles.buttonDisabled]}
          disabled={!prompt.trim() || loading}
        >
          {loading
            ? <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
            : <Ionicons name="arrow-up" size={18} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F4FF',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE7F6',
    gap: 2,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.ai,
    marginTop: 4,
  },
  headerSub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  messageList: {
    padding: 16,
    paddingBottom: 20,
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.ai,
    borderBottomRightRadius: 4,
  },
  lunaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDE7F6',
    borderBottomLeftRadius: 4,
  },
  lunaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  lunaLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.ai,
  },
  bubbleText: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  lunaText: {
    color: COLORS.textMain,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 60,
    gap: 8,
  },
  emptyText: {
    fontFamily: FONTS.medium,
    fontSize: 16,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: FONTS.regular,
    color: '#E53E3E',
    textAlign: 'center',
    padding: 8,
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EDE7F6',
    alignItems: 'flex-end',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#EDE7F6',
    padding: 10,
    borderRadius: 20,
    maxHeight: 100,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textMain,
    backgroundColor: '#FAFAFA',
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.ai,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#CE93D8',
  },
});
