import { Tabs, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@store/auth.store';
import { Colors } from '@constants/colors';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { useState } from 'react';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  focused,
  color,
  active,
  inactive,
}: {
  focused: boolean;
  color: string;
  active: IoniconsName;
  inactive: IoniconsName;
}) {
  return <Ionicons name={focused ? active : inactive} size={24} color={color} />;
}

function PostTabIcon() {
  return (
    <View style={styles.postCircle}>
      <Ionicons name="add" size={28} color={Colors.dark} />
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin ?? false;
  const insets = useSafeAreaInsets();
  const requireAuth = useRequireAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.dark,
        tabBarInactiveTintColor: Colors.lightMuted,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarLabel: t('tabs.home'),
          tabBarIcon: (props) => (
            <TabIcon {...props} active="home" inactive="home-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: t('tabs.search'),
          tabBarLabel: t('tabs.search'),
          tabBarIcon: (props) => (
            <TabIcon {...props} active="search" inactive="search-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: t('tabs.post'),
          tabBarLabel: '',
          tabBarIcon: () => <PostTabIcon />,
          tabBarItemStyle: { marginTop: -10 },
          tabBarStyle: { display: 'none' },
        }}
        listeners={{
          tabPress: (e) => {
            if (!user) {
              e.preventDefault();
              setShowLoginPrompt(true);
            }
          },
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('tabs.saved'),
          tabBarLabel: t('tabs.saved'),
          tabBarIcon: (props) => (
            <TabIcon {...props} active="heart" inactive="heart-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: (props) => (
            <TabIcon {...props} active="person" inactive="person-outline" />
          ),
        }}
      />
    </Tabs>

    <LoginPromptModal
      visible={showLoginPrompt}
      title={t('auth.login_required', 'Login Required')}
      message={t('auth.login_to_post', 'Please log in to post a new property.')}
      onCancel={() => setShowLoginPrompt(false)}
      onConfirm={() => {
        setShowLoginPrompt(false);
        requireAuth(() => router.push('/(tabs)/post'));
      }}
    />
    </>
  );
}

const styles = StyleSheet.create({
  postCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
