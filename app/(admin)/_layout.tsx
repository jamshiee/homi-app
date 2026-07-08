import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '@constants/colors';
import { useTranslation } from 'react-i18next';

export default function AdminLayout() {
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.dark,
        headerTitleStyle: { fontWeight: 'bold' },
        headerBackVisible: false,
      }}
    >
      <Stack.Screen
        name="featured/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="featured/add"
        options={{
          title: t('featured.select_property', 'Select Property'),
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="moderation/index"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
