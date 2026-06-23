import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@constants/colors';
import Markdown from 'react-native-markdown-display';
import { aiApi } from '@api/ai.api';

// ─── Types ────────────────────────────────────────────────────────────────────

type MessageStatus = 'ok' | 'error';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  status: MessageStatus;
  timestamp: number;
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <View style={styles.messageRow}>
      <View style={styles.assistantAvatar}>
        <Ionicons name="sparkles" size={14} color={Colors.dark} />
      </View>
      <View style={[styles.bubble, styles.assistantBubble, styles.typingBubble]}>
        <ActivityIndicator size="small" color={Colors.muted} />
      </View>
    </View>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────

interface MessageBubbleProps {
  message: Message;
  onRetry: (id: string) => void;
}

function MessageBubble({ message, onRetry }: MessageBubbleProps) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageRow, isUser ? styles.userRow : styles.assistantRow]}>
      {!isUser && (
        <View style={styles.assistantAvatar}>
          <Ionicons name="sparkles" size={14} color={Colors.dark} />
        </View>
      )}
      <TouchableOpacity
        activeOpacity={message.status === 'error' ? 0.7 : 1}
        onPress={message.status === 'error' ? () => onRetry(message.id) : undefined}
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
          message.status === 'error' && styles.errorBubble,
        ]}
      >
        {isUser ? (
  <Text style={[styles.bubbleText, styles.userText]}>
    {message.text}
  </Text>
) : (
  <Markdown
    style={{
      body: {
        color: Colors.dark,
        fontSize: 16,
        lineHeight: 24,
      },
      paragraph: {
        marginTop: 0,
        marginBottom: 12,
      },
      bullet_list: {
        marginBottom: 12,
      },
      ordered_list: {
        marginBottom: 12,
      },
    }}
  >
    {message.text}
  </Markdown>
)}
      </TouchableOpacity>
    </View>
  );
}

// ─── Suggested Chips ──────────────────────────────────────────────────────────

interface SuggestedChipsProps {
  onSelect: (text: string) => void;
}

function SuggestedChips({ onSelect }: SuggestedChipsProps) {
  const { t } = useTranslation();
  const chips = [
    t('ai.suggested_post'),
    t('ai.suggested_save'),
    t('ai.suggested_featured'),
    t('ai.suggested_contact'),
    t('ai.suggested_edit'),
  ];

  return (
    <View style={styles.chipsWrapper}>
      {chips.map((chip) => (
        <TouchableOpacity
          key={chip}
          style={styles.chip}
          onPress={() => onSelect(chip)}
          activeOpacity={0.7}
        >
          <Text style={styles.chipText}>{chip}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Empty State (rendered as first item in inverted list) ────────────────────

interface EmptyStateProps {
  onChipSelect: (text: string) => void;
}

function EmptyState({ onChipSelect }: EmptyStateProps) {
  const { t } = useTranslation();
  return (
    // rotateY(180deg) cancels the FlatList inverted transform so text reads correctly
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="sparkles" size={36} color={Colors.dark} />
      </View>
      <Text style={styles.emptyTitle}>{t('ai.title')}</Text>
      <Text style={styles.emptySubtitle}>{t('ai.subtitle')}</Text>
      <SuggestedChips onSelect={onChipSelect} />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AssistantScreen() {
  const { t } = useTranslation();
  // Messages stored newest-first so the inverted FlatList shows latest at bottom
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList<Message>>(null);

  const sendMessage = useCallback(
    async (text: string, retryUserMsgId?: string) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: Message = {
        id: retryUserMsgId ?? `msg_${Date.now()}_user`,
        role: 'user',
        text: trimmed,
        status: 'ok',
        timestamp: Date.now(),
      };

      setMessages((prev) => {
        if (retryUserMsgId) {
          // Replace from that index onward (drop the error assistant reply too)
          const idx = prev.findIndex((m) => m.id === retryUserMsgId);
          // prev is newest-first; entries before idx are newer, keep them
          return idx >= 0
            ? [userMsg, ...prev.slice(0, idx)]
            : [userMsg, ...prev];
        }
        return [userMsg, ...prev];
      });

      setInput('');
      setIsLoading(true);

      try {
        const res = await aiApi.chat(trimmed);
        const responseText =
          (res.data as any)?.response ??
          (res.data as any)?.data?.response ??
          '';

        const assistantMsg: Message = {
          id: `msg_${Date.now()}_assistant`,
          role: 'assistant',
          text: responseText,
          status: 'ok',
          timestamp: Date.now(),
        };
        setMessages((prev) => [assistantMsg, ...prev]);
      } catch {
        const errorMsg: Message = {
          id: `msg_${Date.now()}_assistant_err`,
          role: 'assistant',
          text: '',
          status: 'error',
          timestamp: Date.now(),
        };
        setMessages((prev) => [errorMsg, ...prev]);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading],
  );

  const handleRetry = useCallback(
    (errorMsgId: string) => {
      setMessages((prev) => {
        // prev is newest-first; error msg is at some index, user msg is at index+1
        const errorIdx = prev.findIndex((m) => m.id === errorMsgId);
        if (errorIdx < 0) return prev;
        const userMsg = prev[errorIdx + 1];
        if (!userMsg || userMsg.role !== 'user') return prev;
        // Remove the error message, then re-send
        const withoutError = prev.filter((m) => m.id !== errorMsgId);
        setTimeout(() => sendMessage(userMsg.text, userMsg.id), 50);
        return withoutError;
      });
    },
    [sendMessage],
  );

  const renderItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageBubble message={item} onRetry={handleRetry} />
    ),
    [handleRetry],
  );

  const keyExtractor = useCallback((item: Message) => item.id, []);

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.dark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Ionicons name="sparkles" size={18} color={Colors.yellow} />
          <Text style={styles.headerTitle}>{t('ai.title')}</Text>
        </View>
        {/* spacer to keep title centred */}
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/*
          TouchableWithoutFeedback wraps only the list area so tapping
          anywhere on the chat background dismisses the keyboard.
          The input bar is outside so it stays focusable.
        */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.flex}>
            {isEmpty ? (
              // True vertical centre between header and input bar
              <View style={styles.emptyCentre}>
                <EmptyState onChipSelect={(chip) => sendMessage(chip)} />
              </View>
            ) : (
              <FlatList
                ref={flatListRef}
                // inverted flips render direction: index-0 (newest) is at the bottom
                inverted
                data={messages}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.messageList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                // typing indicator sits at bottom (visual top before inversion)
                ListHeaderComponent={isLoading ? <TypingIndicator /> : null}
              />
            )}
          </View>
        </TouchableWithoutFeedback>

        {/* Input bar — always outside the dismissible area */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={input}
            onChangeText={setInput}
            placeholder={t('ai.input_placeholder')}
            placeholderTextColor={Colors.lightMuted}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => sendMessage(input)}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.dark} />
            ) : (
              <Ionicons
                name="arrow-up"
                size={20}
                color={!input.trim() ? Colors.lightMuted : Colors.dark}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  flex: {
    flex: 1,
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: 36,
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,

  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.dark,
  },

  // ── Empty state ──
  // flex:1 parent ensures it fills the space between header and input bar,
  // then justifyContent:'center' truly centres it.
  emptyCentre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    width: '100%',
  },
  emptyIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // ── Suggested chips ──
  chipsWrapper: {
    width: '100%',
    gap: 10,
  },
  chip: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    color: Colors.dark,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ── Message list ──
  // inverted FlatList: contentContainer padding is flipped,
  // so paddingTop here adds space at the visual bottom.
  messageList: {
    paddingHorizontal: 16,
    paddingTop: 16,   // visual bottom gap (inverted)
    paddingBottom: 8, // visual top gap
  },
  messageRow: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
    gap: 8,
  },
  assistantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: Colors.dark,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.dark,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },

  // ── Typing indicator ──
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 60,
    alignItems: 'center',
  },

  // ── Input bar ──
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
    paddingBottom:20
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: Colors.dark,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
