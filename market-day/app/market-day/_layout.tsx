import { Stack } from 'expo-router';
import { colors } from '@/constants/theme';

export default function MarketDayLayout() {
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.screen } }} />;
}
