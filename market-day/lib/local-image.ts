import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

export type BusinessImageKind = 'logo' | 'zelle-qr' | 'venmo-qr';

const BUSINESS_IMAGE_DIR = `${FileSystem.documentDirectory ?? ''}business/`;

async function ensureBusinessImageDir(): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  const info = await FileSystem.getInfoAsync(BUSINESS_IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BUSINESS_IMAGE_DIR, { intermediates: true });
  }
}

function extensionForUri(uri: string): string {
  const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  const ext = match?.[1]?.toLowerCase();
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp' || ext === 'heic') {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
}

export async function persistBusinessImage(
  sourceUri: string,
  kind: BusinessImageKind,
): Promise<string> {
  if (!FileSystem.documentDirectory) {
    return sourceUri;
  }

  await ensureBusinessImageDir();
  const destination = `${BUSINESS_IMAGE_DIR}${kind}-${Date.now()}.${extensionForUri(sourceUri)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export async function deleteBusinessImage(uri: string | null): Promise<void> {
  if (!uri || !FileSystem.documentDirectory) return;
  if (!uri.startsWith(BUSINESS_IMAGE_DIR)) return;

  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

export async function pickBusinessImage(kind: BusinessImageKind): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: kind === 'logo',
    aspect: kind === 'logo' ? [1, 1] : undefined,
    quality: 0.9,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return persistBusinessImage(result.assets[0].uri, kind);
}
