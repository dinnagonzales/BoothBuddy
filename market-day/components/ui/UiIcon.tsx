import type { LucideIcon, LucideProps } from 'lucide-react-native';

import { colors } from '@/constants/theme';

export const UI_ICON_SIZE = 22;
export const UI_ICON_STROKE = 2.5;

type UiIconProps = LucideProps & {
  icon: LucideIcon;
};

/** Shared defaults for Booth Buddy chrome icons (Lucide). */
export function UiIcon({
  icon: Icon,
  size = UI_ICON_SIZE,
  color = colors.ink,
  strokeWidth = UI_ICON_STROKE,
  ...props
}: UiIconProps) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} {...props} />;
}
