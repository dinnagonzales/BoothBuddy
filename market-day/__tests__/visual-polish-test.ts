import { APP_FONT_FACES } from '@/constants/app-fonts';
import { fonts, radii, spacing, touchTargets } from '@/constants/visual';

test('heading fonts use Fredoka and body fonts use Nunito', () => {
  expect(fonts.heading.semiBold).toBe('Fredoka_600SemiBold');
  expect(fonts.heading.bold).toBe('Fredoka_700Bold');
  expect(fonts.body.regular).toBe('Nunito_400Regular');
  expect(fonts.body.extraBold).toBe('Nunito_800ExtraBold');
});

test('radii match screens.html mock', () => {
  expect(radii.itemRow).toBe(16);
  expect(radii.cart).toBe(18);
  expect(radii.payOption).toBe(18);
  expect(radii.checkout).toBe(16);
  expect(radii.sellCta).toBe(20);
  expect(radii.settingsRow).toBe(16);
  expect(radii.statsBox).toBe(18);
  expect(radii.completeBtn).toBe(18);
});

test('screen spacing matches screens.html mock', () => {
  expect(spacing.screen).toBe(16);
  expect(spacing.itemListGap).toBe(8);
});

test('touch targets stay large enough for a 12-year-old', () => {
  expect(touchTargets.minSize).toBeGreaterThanOrEqual(44);
  expect(touchTargets.addButton).toBeGreaterThanOrEqual(touchTargets.minSize);
});

test('app registers every font face needed for polish screens', () => {
  expect(Object.keys(APP_FONT_FACES).sort()).toEqual([
    'Fredoka_500Medium',
    'Fredoka_600SemiBold',
    'Fredoka_700Bold',
    'Nunito_400Regular',
    'Nunito_600SemiBold',
    'Nunito_700Bold',
    'Nunito_800ExtraBold',
  ]);
});
