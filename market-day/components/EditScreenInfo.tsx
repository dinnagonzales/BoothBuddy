import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { tokens } from '@/theme/tokens';

export function EditScreenInfo({ path }: { path: string }) {
  return (
    <View>
      <View style={styles.getStartedContainer}>
        <Text style={styles.getStartedText}>
          Open up the code for this screen:
        </Text>

        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
          <Text style={styles.codeHighlightText}>{path}</Text>
        </View>

        <Text style={styles.getStartedText}>
          Change any of the text, save the file, and your app will automatically update.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  getStartedContainer: {
    alignItems: 'center',
    marginHorizontal: 50,
  },
  homeScreenFilename: {
    marginVertical: 7,
  },
  codeHighlightContainer: {
    borderRadius: 3,
    paddingHorizontal: 4,
    backgroundColor: tokens.shadow.soft,
  },
  codeHighlightText: {
    fontFamily: fonts.body.regular,
    fontSize: 14,
    lineHeight: 24,
    color: colors.ink,
  },
  getStartedText: {
    fontFamily: fonts.body.regular,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    color: colors.ink,
  },
});
