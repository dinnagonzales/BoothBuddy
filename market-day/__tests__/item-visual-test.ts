import {
  CHECKOUT_PHOTO_SIZE,
  HOME_MENU_PHOTO_SIZE,
  homeVisualSize,
  isItemVisualComplete,
  resolveItemVisual,
} from '@/lib/item-visual';

test('item visual must be image XOR icon — not both, not neither', () => {
  expect(isItemVisualComplete({ icon: '🐣', photoUri: null })).toBe(true);
  expect(isItemVisualComplete({ icon: '', photoUri: 'file:///items/tamagotchi.jpg' })).toBe(true);
  expect(isItemVisualComplete({ icon: '🐣', photoUri: 'file:///items/tamagotchi.jpg' })).toBe(
    false,
  );
  expect(isItemVisualComplete({ icon: '', photoUri: null })).toBe(false);
  expect(isItemVisualComplete({ icon: '   ', photoUri: null })).toBe(false);
});

test('resolveItemVisual returns photo-only when a photo is chosen', () => {
  expect(
    resolveItemVisual({ icon: '', photoUri: 'file:///items/tamagotchi.jpg' }),
  ).toEqual({
    mode: 'photo',
    uri: 'file:///items/tamagotchi.jpg',
  });
});

test('resolveItemVisual returns icon-only when no photo', () => {
  expect(resolveItemVisual({ icon: '🐣', photoUri: null })).toEqual({
    mode: 'icon',
    icon: '🐣',
  });
});

test('neither icon nor photo resolves to null (empty pink tile on Home)', () => {
  expect(resolveItemVisual({ icon: '', photoUri: null })).toBeNull();
});

test('Home photo tiles are large enough to read clearly (not a 40px chip)', () => {
  const visual = resolveItemVisual({
    icon: '',
    photoUri: 'file:///items/tamagotchi.jpg',
  });
  expect(visual).not.toBeNull();
  expect(HOME_MENU_PHOTO_SIZE).toBeGreaterThanOrEqual(88);
  expect(homeVisualSize(visual!)).toBeGreaterThanOrEqual(88);
});

test('checkout photo tiles stay clearly larger than emoji chip size', () => {
  expect(CHECKOUT_PHOTO_SIZE).toBeGreaterThanOrEqual(56);
});
