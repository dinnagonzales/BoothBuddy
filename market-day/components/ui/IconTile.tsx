import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType, type ViewStyle } from 'react-native';

import { colors } from '@/constants/theme';
import { tokens } from '@/theme/tokens';

type IconTileProps = {
  icon?: string;
  imageSource?: ImageSourcePropType;
  size?: number;
  style?: ViewStyle;
};

/** Rounded-square tile like the bear icon lockup — for logos and item photos. */
export function IconTile({ icon, imageSource, size = 56, style }: IconTileProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageSource]);

  const showImage = Boolean(imageSource) && !imageFailed;

  return (
    <View style={[styles.tile, { width: size, height: size, borderRadius: tokens.radius.md }, style]}>
      {showImage ? (
        <Image
          source={imageSource}
          resizeMode="cover"
          onError={() => setImageFailed(true)}
          style={{ width: size, height: size, borderRadius: tokens.radius.md }}
        />
      ) : icon ? (
        <Text style={[styles.icon, { fontSize: size * 0.55, lineHeight: size * 0.62 }]}>{icon}</Text>
      ) : imageSource ? (
        <Text style={[styles.icon, { fontSize: size * 0.45, lineHeight: size * 0.55 }]}>📷</Text>
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
