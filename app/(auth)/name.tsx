import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { Colors } from '@constants/colors';
import { apiClient } from '@api/client';
import { useAuthStore } from '@store/auth.store';

export default function NameScreen() {
  const { t } = useTranslation();
  const { updateUser } = useAuthStore();
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await apiClient.patch('/users/me', { name: name.trim() });
      updateUser({ name: name.trim() });
      router.replace('/(tabs)');
    } catch {
      Toast.show({
        type: 'info',
        text1: t('auth.profile_saved_title'),
        text2: t('auth.profile_saved_body'),
      });
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.yellow }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}
        >
          <Text
            style={{
              fontSize: 34,
              fontWeight: '600',
              color: Colors.dark,
              textAlign: 'left',
              marginBottom: 12,
            }}
          >
            {t('auth.name_title')}
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: Colors.muted,
              textAlign: 'left',
              marginBottom: 40,
            }}
          >
            {t('auth.name_subtitle')}
          </Text>

          <Text
            style={{
              fontSize: 11,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: Colors.muted,
              marginBottom: 8,
            }}
          >
            {t('auth.name_label')}
          </Text>

          <TextInput
            style={{
              backgroundColor: Colors.softYellow,
              borderRadius: 30,
              height: 60,
              paddingHorizontal: 20,
              fontSize: 17,
              color: Colors.dark,
              borderWidth: 1.5,
              borderColor: focused ? Colors.borderFocus : 'transparent',
            }}
            placeholder={t('auth.name_placeholder')}
            placeholderTextColor={Colors.lightMuted}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoFocus
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="done"
            onSubmitEditing={name.trim() ? handleContinue : undefined}
          />

          <TouchableOpacity
            style={{
              marginTop: 32,
              backgroundColor: name.trim() ? Colors.dark : Colors.border,
              borderRadius: 30,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleContinue}
            disabled={!name.trim() || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text
                style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}
              >
                {t('auth.continue')}
              </Text>
            )}
          </TouchableOpacity>

          {/* <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            style={{ marginTop: 16, alignItems: 'center' }}
          >
            <Text style={{ fontSize: 13, color: Colors.muted }}>
              {t('auth.skip')}
            </Text>
          </TouchableOpacity> */}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
