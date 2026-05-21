import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';
import { useAuthStore } from '@store/auth.store';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.white }}>
      <View style={{ flex: 1, padding: 24 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', color: Colors.dark }}>
          {user?.name || user?.phone}
        </Text>
        <TouchableOpacity onPress={() => void logout()} style={{ marginTop: 24 }}>
          <Text style={{ color: Colors.error, fontWeight: '600' }}>
            {t('profile.logout')}
          </Text>
        </TouchableOpacity>
        <Text style={{ marginTop: 16, color: Colors.muted }}>
          {t('stub.profile')}
        </Text>
      </View>
    </SafeAreaView>
  );
}
