import { normalizeZelleContactInput } from '@/lib/contact-format';

export type BusinessSettings = {
  businessName: string;
  businessLogoUri: string | null;
  zelleName: string;
  zelleContact: string;
  zelleQrUri: string | null;
  venmoHandle: string;
  venmoQrUri: string | null;
};

export const BUSINESS_SETTINGS_KEYS = {
  businessName: 'business_name',
  businessLogoUri: 'business_logo_uri',
  zelleName: 'zelle_name',
  zelleContact: 'zelle_contact',
  zelleQrUri: 'zelle_qr_uri',
  venmoHandle: 'venmo_handle',
  venmoQrUri: 'venmo_qr_uri',
} as const;

export const EMPTY_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: '',
  businessLogoUri: null,
  zelleName: '',
  zelleContact: '',
  zelleQrUri: null,
  venmoHandle: '',
  venmoQrUri: null,
};

export function normalizeOptionalText(value: string | null | undefined): string {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : '';
}

export function normalizeOptionalUri(value: string | null | undefined): string | null {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export function normalizeVenmoHandle(handle: string): string {
  return handle.trim().replace(/^@+/, '');
}

export function normalizeBusinessSettings(input: Partial<BusinessSettings>): BusinessSettings {
  return {
    businessName: normalizeOptionalText(input.businessName),
    businessLogoUri: normalizeOptionalUri(input.businessLogoUri),
    zelleName: normalizeOptionalText(input.zelleName),
    zelleContact: normalizeZelleContactInput(input.zelleContact ?? ''),
    zelleQrUri: normalizeOptionalUri(input.zelleQrUri),
    venmoHandle: normalizeVenmoHandle(input.venmoHandle ?? ''),
    venmoQrUri: normalizeOptionalUri(input.venmoQrUri),
  };
}

export function businessSettingsEqual(a: BusinessSettings, b: BusinessSettings): boolean {
  return (
    a.businessName === b.businessName &&
    a.businessLogoUri === b.businessLogoUri &&
    a.zelleName === b.zelleName &&
    a.zelleContact === b.zelleContact &&
    a.zelleQrUri === b.zelleQrUri &&
    a.venmoHandle === b.venmoHandle &&
    a.venmoQrUri === b.venmoQrUri
  );
}
