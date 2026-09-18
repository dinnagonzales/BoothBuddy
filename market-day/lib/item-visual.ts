/** How an Item appears on Home, checkout, and inventory rows. */

export type ItemVisualDraft = {
  icon: string;
  photoUri: string | null;
};

export type ItemVisual =
  | { mode: 'photo'; uri: string }
  | { mode: 'icon'; icon: string };

/**
 * Home menu tiles are square; photos must dominate the tile, not sit as a tiny
 * emoji-sized chip.
 */
export const HOME_MENU_PHOTO_SIZE = 104;

/** Emoji icons stay compact on Home menu tiles. */
export const HOME_MENU_ICON_SIZE = 40;

export const CHECKOUT_PHOTO_SIZE = 64;
export const CHECKOUT_ICON_SIZE = 36;

/** Exactly one of photo or icon — not both, not neither. */
export function isItemVisualComplete(draft: ItemVisualDraft): boolean {
  const hasPhoto = Boolean(draft.photoUri);
  const hasIcon = draft.icon.trim().length > 0;
  return hasPhoto !== hasIcon;
}

/** Prefer photo when present. Empty icon + no photo → null (empty tile). */
export function resolveItemVisual(draft: ItemVisualDraft): ItemVisual | null {
  if (draft.photoUri) {
    return { mode: 'photo', uri: draft.photoUri };
  }
  if (draft.icon.trim().length > 0) {
    return { mode: 'icon', icon: draft.icon.trim() };
  }
  return null;
}

export function homeVisualSize(visual: ItemVisual): number {
  return visual.mode === 'photo' ? HOME_MENU_PHOTO_SIZE : HOME_MENU_ICON_SIZE;
}

export function checkoutVisualSize(visual: ItemVisual): number {
  return visual.mode === 'photo' ? CHECKOUT_PHOTO_SIZE : CHECKOUT_ICON_SIZE;
}

/** Props for IconTile from an item's stored icon/photo fields. */
export function iconTileProps(draft: ItemVisualDraft): {
  icon?: string;
  imageSource?: { uri: string };
} {
  const visual = resolveItemVisual(draft);
  if (!visual) return {};
  if (visual.mode === 'photo') return { imageSource: { uri: visual.uri } };
  return { icon: visual.icon };
}
