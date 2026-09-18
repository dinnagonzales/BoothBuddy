import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

export type BusinessImageKind = 'logo' | 'zelle-qr' | 'venmo-qr';

const BUSINESS_IMAGE_DIR = `${FileSystem.documentDirectory ?? ''}business/`;
const ITEM_PHOTO_DIR = `${FileSystem.documentDirectory ?? ''}items/`;

async function ensureBusinessImageDir(): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  const info = await FileSystem.getInfoAsync(BUSINESS_IMAGE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(BUSINESS_IMAGE_DIR, { intermediates: true });
  }
}

async function ensureItemPhotoDir(): Promise<void> {
  if (!FileSystem.documentDirectory) return;
  const info = await FileSystem.getInfoAsync(ITEM_PHOTO_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(ITEM_PHOTO_DIR, { intermediates: true });
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

export async function persistItemPhoto(sourceUri: string, itemId: number): Promise<string> {
  if (!FileSystem.documentDirectory) {
    return sourceUri;
  }

  await ensureItemPhotoDir();
  const destination = `${ITEM_PHOTO_DIR}${itemId}-${Date.now()}.${extensionForUri(sourceUri)}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destination });
  return destination;
}

export async function deleteItemPhoto(uri: string | null): Promise<void> {
  if (!uri || !FileSystem.documentDirectory) return;
  if (!uri.startsWith(ITEM_PHOTO_DIR)) return;

  const info = await FileSystem.getInfoAsync(uri);
  if (info.exists) {
    await FileSystem.deleteAsync(uri, { idempotent: true });
  }
}

async function pickItemPhotoFromLibrary(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Photo library permission is required.');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

async function pickItemPhotoFromCamera(): Promise<string | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Camera permission is required.');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
  });

  if (result.canceled || result.assets.length === 0) {
    return null;
  }

  return result.assets[0].uri;
}

export function pickItemPhoto(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return pickItemPhotoFromLibrary();
  }

  return new Promise((resolve, reject) => {
    Alert.alert('Item photo', 'Choose a source', [
      { text: 'Cancel', style: 'cancel', onPress: () => resolve(null) },
      {
        text: 'Photo library',
        onPress: () => {
          void pickItemPhotoFromLibrary().then(resolve).catch(reject);
        },
      },
      {
        text: 'Camera',
        onPress: () => {
          void pickItemPhotoFromCamera().then(resolve).catch(reject);
        },
      },
    ]);
  });
}
