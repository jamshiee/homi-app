export const Config = {
  API_BASE_URL:
    process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
  OTP_LENGTH: 6,
  OTP_RESEND_SECONDS: 60,
  SUPPORTED_LANGUAGES: ['en', 'ml'] as const,
  DEFAULT_LANGUAGE: 'en' as const,
} as const;
