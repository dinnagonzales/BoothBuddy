import type { Router } from 'expo-router';

/** Leave the grown-up area and return to the kid-facing home screen. */
export function leaveGrownUpArea(router: Router) {
  router.replace('/');
}
