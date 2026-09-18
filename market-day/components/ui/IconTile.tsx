import { Image, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

type IconTileProps = {
  icon?: string;
  imageSource?: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
};

/** Rounded-square tile like the bear icon lockup — for logos and item photos. */
export function IconTile({ icon, imageSource, size = 56, style }: IconTileProps) {
  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: tokens.radius.md }, style]}>
      {imageSource ? (
        <Image source={imageSource} style={{ width: size, height: size, borderRadius: tokens.radius.md }} />
      ) : icon ? (
        <Text style={[styles.icon, { fontSize: size * 0.55, lineHeight: size * 0.62 }]}>{icon}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  icon: {
    textAlign: 'center',
  },
});
