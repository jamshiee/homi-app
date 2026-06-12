import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '@constants/colors';

interface StickyContactBarProps {
  onContactPress: () => void;
}

export function StickyContactBar({ onContactPress }: StickyContactBarProps) {
  const { t } = useTranslation();

  return (
    <View className="absolute bottom-0 left-0 right-0 border-t border-gray-200 bg-white">
      <SafeAreaView edges={['bottom']} className="flex-row p-4">
        <TouchableOpacity
          onPress={onContactPress}
          className="h-12 flex-1 items-center justify-center rounded-full bg-yellow-400"
        >
          <Text className="text-[15px] font-bold text-black">
            {t('property.contact')}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
