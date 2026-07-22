import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface LoginPromptModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function LoginPromptModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
}: LoginPromptModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onCancel} />
        
        <View style={styles.modalContent}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-circle" size={56} color={Colors.yellow} />
          </View>
          
          <Text style={styles.title}>
            {title || t('auth.login_required', 'Login Required')}
          </Text>
          
          <Text style={styles.message}>
            {message || t('auth.login_to_continue', 'Please log in to continue.')}
          </Text>
          
          <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.confirmText}>{t('auth.sign_in', 'Sign In')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={onCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelText}>{t('common.cancel', 'Cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: Colors.muted,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  confirmButton: {
    backgroundColor: Colors.yellow,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.muted,
  },
});
