import { Redirect } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function Index() {
  const { user, isHydrated } = useAuthStore();
  if (!isHydrated) return null;
  return user ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/phone" />;
}
