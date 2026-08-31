export type AdminProfile = {
  firstName: string;
  lastName: string;
  businessName: string;
};

export const ADMIN_PROFILE_KEYS = {
  firstName: 'admin_first_name',
  lastName: 'admin_last_name',
  businessName: 'admin_business_name',
} as const;

export const EMPTY_ADMIN_PROFILE: AdminProfile = {
  firstName: '',
  lastName: '',
  businessName: '',
};

export function normalizeAdminProfile(input: Partial<AdminProfile>): AdminProfile {
  return {
    firstName: input.firstName?.trim() ?? '',
    lastName: input.lastName?.trim() ?? '',
    businessName: input.businessName?.trim() ?? '',
  };
}

export function isAdminProfileComplete(profile: AdminProfile): boolean {
  const normalized = normalizeAdminProfile(profile);
  return (
    normalized.firstName.length > 0 &&
    normalized.lastName.length > 0 &&
    normalized.businessName.length > 0
  );
}

export function adminProfileDisplayName(profile: AdminProfile): string {
  const normalized = normalizeAdminProfile(profile);
  return [normalized.firstName, normalized.lastName].filter(Boolean).join(' ');
}
