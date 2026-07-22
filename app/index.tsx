import { Redirect } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export default function Index() {
  const { isHydrated } = useAuthStore();
  if (!isHydrated) return null;
  return <Redirect href="/property-type-select" />;
}
