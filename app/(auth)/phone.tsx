import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import * as Localization from 'expo-localization';
import { Colors } from '@constants/colors';
import { authApi } from '@api/auth.api';
import { useAuthStore } from '@store/auth.store';
import { useAppStore } from '@store/app.store';
import { COUNTRIES, CountryData } from '@constants/countries';
import { Config } from '@/constants/config';
import { OTPWidget } from '@msg91comm/sendotp-react-native';

const WIDGET_ID = process.env.EXPO_PUBLIC_MSG91_WIDGET_ID!;
const TOKEN_AUTH = process.env.EXPO_PUBLIC_MSG91_TOKEN!

export default function PhoneScreen() {
  const { t } = useTranslation();
  const { language, setLanguage } = useAppStore();
  const { isLoading, setLoading } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [focused, setFocused] = useState(false);

;

  // Country Picker State
  const [selectedCountry, setSelectedCountry] = useState<CountryData>(
    COUNTRIES[0],
  );
  const [showPicker, setShowPicker] = useState(false);

  // Auto-detect country on mount
  useEffect(() => {
     console.log('WIDGET_ID:', WIDGET_ID);
  console.log('TOKEN_AUTH:', TOKEN_AUTH);  
      // Initialize MSG91 widget once on mount
    OTPWidget.initializeWidget(WIDGET_ID, TOKEN_AUTH);
    // const deviceCountry = Localization.getLocales()[0]?.regionCode;
    // if (deviceCountry) {
      const found = COUNTRIES.find((c) => c.code === "IN");
      if (found) {
        setSelectedCountry(found);
      }
    // }
  }, []);

  const isValid = /^\d{10}$/.test(phone);

  const handleSend = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      const fullPhone = `${selectedCountry.dialCode.replace('+', '')}${phone}`; // e.g. "919XXXXXXXXX"

      const response = await OTPWidget.sendOTP({ identifier: fullPhone });

      if (response?.type !== 'success') {
        console.log("Error Response from MSG91:", response);
        throw new Error(response?.message || 'Failed to send OTP');
      }

      console.log("Success Response from MSG91:", response);

      router.push({
        pathname: '/(auth)/otp',
        params: { 
          phone: fullPhone,
          reqId: response.message,  // ← this is the reqId
        },
      });
    } catch (err: unknown) {
      const e = err as { message?: string };
      Toast.show({
        type: 'error',
        text1: e?.message || t('common.error_generic'),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.yellow }}>
      <View
        style={{
          position: 'absolute',
          top: 60,
          right: 24,
          zIndex: 10,
          flexDirection: 'row',
          backgroundColor: 'rgba(0,0,0,0.05)',
          borderRadius: 20,
          padding: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => setLanguage('en')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: language === 'en' ? Colors.white : 'transparent',
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: language === 'en' ? Colors.dark : Colors.muted,
            }}
          >
            EN
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setLanguage('ml')}
          style={{
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: language === 'ml' ? Colors.white : 'transparent',
            borderRadius: 16,
          }}
        >
          <Text
            style={{
              fontSize: 12,
              fontWeight: '700',
              color: language === 'ml' ? Colors.dark : Colors.muted,
            }}
          >
            മല
          </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View
          style={{ flex: 1, paddingHorizontal: 24, justifyContent: 'center' }}
        >
          <Text
            style={{
              fontSize: 42,
              color: Colors.dark,
              textAlign: 'left',
              marginBottom: 8,
              fontWeight: '600',
            }}
          >
            {t('auth.phone_title')}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: Colors.muted,
              textAlign: 'left',
              marginBottom: 40,
            }}
          >
            {t('auth.phone_hint')}
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
            {t('auth.phone_label')}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              backgroundColor: Colors.softYellow,
              borderRadius: 30,
              height: 60,
              alignItems: 'center',
              borderWidth: 1.5,
              borderColor: focused ? Colors.yellow : 'transparent',
            }}
          >
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{
                paddingHorizontal: 16,
                borderRightWidth: 1,
                borderRightColor: Colors.border,
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 24 }}>{selectedCountry.flag}</Text>
              <Text
                style={{ fontSize: 16, color: Colors.dark, fontWeight: '600' }}
              >
                {selectedCountry.dialCode}
              </Text>
            </TouchableOpacity>
            <TextInput
              style={{
                flex: 1,
                paddingHorizontal: 16,
                fontSize: 18,
                color: Colors.dark,
              }}
              keyboardType="phone-pad"
              placeholder={t('auth.phone_placeholder')}
              placeholderTextColor={Colors.lightMuted}
              value={phone}
              onChangeText={(v) => setPhone(v.replace(/\D/g, '').slice(0, 10))}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={10}
              returnKeyType="done"
              onSubmitEditing={isValid ? handleSend : undefined}
            />
          </View>

          {/* Custom Country Picker Modal */}
          <Modal visible={showPicker} animationType="slide" transparent>
            <Pressable
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.5)',
                justifyContent: 'flex-end',
              }}
              onPress={() => setShowPicker(false)}
            >
              <View
                style={{
                  backgroundColor: Colors.white,
                  borderTopLeftRadius: 30,
                  borderTopRightRadius: 30,
                  height: '60%',
                  padding: 24,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: '700',
                      color: Colors.dark,
                    }}
                  >
                    Select Country
                  </Text>
                  <TouchableOpacity onPress={() => setShowPicker(false)}>
                    <Text
                      style={{
                        color: Colors.muted,
                        fontSize: 16,
                        fontWeight: '600',
                      }}
                    >
                      Close
                    </Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  data={COUNTRIES}
                  keyExtractor={(item) => item.code}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedCountry(item);
                        setShowPicker(false);
                      }}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.softYellow,
                      }}
                    >
                      <Text style={{ fontSize: 24, marginRight: 16 }}>
                        {item.flag}
                      </Text>
                      <Text
                        style={{
                          flex: 1,
                          fontSize: 16,
                          color: Colors.dark,
                          fontWeight: item.code === selectedCountry.code ? '700' : '400',
                        }}
                      >
                        {item.name}
                      </Text>
                      <Text style={{ fontSize: 16, color: Colors.muted }}>
                        {item.dialCode}
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            </Pressable>
          </Modal>

          <TouchableOpacity
            style={{
              marginTop: 32,
              backgroundColor: isValid ? Colors.dark : Colors.border,
              borderRadius: 30,
              height: 56,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleSend}
            disabled={!isValid || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text
                style={{ color: Colors.white, fontWeight: '600', fontSize: 16 }}
              >
                {t('auth.send_otp')}
              </Text>
            )}
          </TouchableOpacity>

          <Text
            style={{
              marginTop: 20,
              fontSize: 11,
              color: Colors.muted,
              textAlign: 'center',
            }}
          >
            {t('auth.terms')}
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
