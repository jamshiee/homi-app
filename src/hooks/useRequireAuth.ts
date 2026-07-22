import { useRouter } from 'expo-router';
import { useAuthStore } from '@store/auth.store';

export function useRequireAuth() {
  const router = useRouter();
  const { user, setPostLoginAction } = useAuthStore();

  const requireAuth = (action?: () => void) => {
    if (user) {
      if (action) action();
    } else {
      setPostLoginAction(action || null);
      router.push('/(auth)/phone');
    }
  };

  return requireAuth;
}
