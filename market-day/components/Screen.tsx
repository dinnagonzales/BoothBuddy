import type { ReactNode } from 'react';
import { Pressable, Text, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Card, cn } from '@/components/ui';

type ScreenProps = ViewProps & {
  children: ReactNode;
  className?: string;
};

export function Screen({ children, className, ...props }: ScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className={cn('flex-1 px-4', className)} {...props}>
        {children}
      </View>
    </SafeAreaView>
  );
}

type ScreenHeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function ScreenHeader({ title, onBack, right }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-center justify-between py-2 mb-2">
      {onBack ? (
        <Pressable onPress={onBack} className="min-w-[60px]">
          <Text className="text-accent font-bold">← Back</Text>
        </Pressable>
      ) : (
        <View className="min-w-[60px]" />
      )}
      <Text className="text-base font-bold text-foreground">{title}</Text>
      <View className="min-w-[60px] items-end">{right ?? null}</View>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Text className="text-[11px] font-extrabold uppercase tracking-wide text-muted mb-2">
      {children}
    </Text>
  );
}

type ItemCardProps = {
  emoji: string;
  name: string;
  priceLabel: string;
  onAdd?: () => void;
};

export function ItemCard({ emoji, name, priceLabel, onAdd }: ItemCardProps) {
  return (
    <Card className="p-0">
      <View className="flex-row items-center gap-2.5 px-3 py-2.5">
        <Text className="text-[22px] w-7 text-center">{emoji}</Text>
        <Text className="flex-1 text-sm font-extrabold text-foreground">{name}</Text>
        <Text className="text-sm font-semibold text-accent mr-1">{priceLabel}</Text>
        {onAdd ? (
          <Button size="sm" isIconOnly className="w-[30px] h-[30px] rounded-full" onPress={onAdd}>
            <Button.Label className="text-lg">+</Button.Label>
          </Button>
        ) : null}
      </View>
    </Card>
  );
}
