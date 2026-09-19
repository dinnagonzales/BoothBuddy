import { colors } from '@/constants/theme';
import { tokens } from '@/theme/tokens';

/** colors.* keys used by settings.tsx and past/[id].tsx (re-export banner included). */
const REFERENCED_BY_SETTINGS_AND_PAST = [
  'ink',
  'inkSoft',
  'white',
  'grayLight',
  'purple',
  'purpleDark',
  'redDark',
  'borderDanger',
  'borderSubtle',
  'warningSurface',
  'warningBorder',
] as const;

test('warningBorder is defined in the warning color family', () => {
  expect(colors.warningBorder).toBe(tokens.color.warningBorder);
  expect(colors.warningBorder).toMatch(/^#/);
  expect(colors.warningSurface).toBe(tokens.color.warningSurface);
});

test('every colors token referenced by settings and past event screens exists', () => {
  for (const key of REFERENCED_BY_SETTINGS_AND_PAST) {
    expect(key in colors).toBe(true);
    expect(colors[key]).toMatch(/^#/);
  }
});
