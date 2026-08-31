import type { Router } from 'expo-router';

/** Leave owner settings and return to the staff-facing home screen. */
export function leaveGrownUpArea(router: Router) {
  router.replace('/');
}
