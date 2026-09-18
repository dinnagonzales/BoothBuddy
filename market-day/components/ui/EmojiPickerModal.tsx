import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { colors } from '@/constants/theme';
import { fonts } from '@/constants/visual';
import { COMMON_EMOJIS } from '@/lib/common-emojis';
import { tokens } from '@/theme/tokens';

type EmojiPickerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSelect: (emoji: string) => void;
};

export function EmojiPickerModal({ visible, onClose, onSelect }: EmojiPickerModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <View style={styles.handle} />
          <Text style={styles.title}>Pick an icon</Text>
          <ScrollView contentContainerStyle={styles.grid} keyboardShouldPersistTaps="handled">
            {COMMON_EMOJIS.map((emoji) => (
              <Pressable
                key={emoji}
                accessibilityRole="button"
                accessibilityLabel={`Select ${emoji}`}
                onPress={() => {
                  onSelect(emoji);
                  onClose();
                }}
                style={({ pressed }) => [styles.cell, pressed && styles.cellPressed]}>
                <Text style={styles.emoji}>{emoji}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Pressable
            accessibilityRole="button"
            onPress={onClose}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.cancelButtonPressed]}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    maxHeight: '70%',
    backgroundColor: colors.white,
    borderTopLeftRadius: tokens.radius.lg,
    borderTopRightRadius: tokens.radius.lg,
    paddingTop: tokens.spacing[2],
    paddingHorizontal: tokens.spacing[4],
    paddingBottom: tokens.spacing[6],
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.grayLight,
    marginBottom: tokens.spacing[3],
  },
  title: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 18,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: tokens.spacing[3],
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: tokens.spacing[2],
    paddingBottom: tokens.spacing[3],
  },
  cell: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.radius.sm,
    backgroundColor: colors.background,
  },
  cellPressed: {
    opacity: 0.7,
  },
  emoji: {
    fontSize: 28,
    lineHeight: 32,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: tokens.spacing[3],
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelLabel: {
    fontFamily: fonts.body.bold,
    fontSize: 16,
    color: colors.inkSoft,
  },
});
