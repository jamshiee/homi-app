import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@store/auth.store';
import { Colors } from '@constants/colors';

export default function TabsLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin ?? false;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.dark,
        tabBarInactiveTintColor: Colors.lightMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarLabel: t('tabs.home') }}
      />
      <Tabs.Screen
        name="search"
        options={{ title: t('tabs.search'), tabBarLabel: t('tabs.search') }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: t('tabs.post'),
          tabBarLabel: t('tabs.post'),
          href: isAdmin ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{ title: t('tabs.saved'), tabBarLabel: t('tabs.saved') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarLabel: t('tabs.profile') }}
      />
    </Tabs>
  );
}
