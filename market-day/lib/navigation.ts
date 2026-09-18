import type { Href, Router } from 'expo-router';

/** Leave owner settings and return to the staff-facing home screen. */
export function leaveGrownUpArea(router: Router) {
  router.replace('/');
}

/** Go back when history exists; otherwise replace to a sensible fallback. */
export function safeBack(router: Router, fallback: Href = '/') {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
