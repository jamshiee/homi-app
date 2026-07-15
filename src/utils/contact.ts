import { Linking } from 'react-native';

export async function openWhatsApp(
  phone: string,
  propertyTitle: string,
  serialNo?: string,
): Promise<void> {
  const number = phone.replace('+', '');
  const message = encodeURIComponent(
    `Hi, I'm interested in your property: ${propertyTitle} ${serialNo ? ' (Serial No: ' + serialNo + ')' : ''}`,
  );
  const url = `whatsapp://send?phone=${number}&text=${message}`;
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(`https://wa.me/${number}?text=${message}`);
  }
}

export function openPhone(phone: string): void {
  Linking.openURL(`tel:${phone}`);
}
