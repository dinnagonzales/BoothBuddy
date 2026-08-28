import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ParentalGatePrompt } from '@/components/ParentalGatePrompt';
import { colors } from '@/constants/theme';

type PassCodeSheetProps = {
  visible: boolean;
  title?: string;
  subtitle?: string;
  errorText?: string;
  onClose: () => void;
  onSubmit: (code: string) => Promise<boolean>;
  onSuccess: () => void;
  onForgotCode?: () => Promise<void>;
};

export function PassCodeSheet({
  visible,
  title = 'Pass Code',
  subtitle,
  errorText = 'That code is not right.',
  onClose,
  onSubmit,
  onSuccess,
  onForgotCode,
}: PassCodeSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(140)}
          style={styles.backdrop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close pass code"
            onPress={onClose}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={insets.top}
          style={styles.centerWrap}>
          <Animated.View
            entering={ZoomIn.duration(200)}
            exiting={ZoomOut.duration(140)}
            style={styles.card}>
            <Text style={styles.sheetTitle}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <ParentalGatePrompt
              title=""
              errorText={errorText}
              submitLabel="Unlock"
              autoSubmit
              compact
              onSubmit={async (code) => {
                const ok = await onSubmit(code);
                if (ok) onSuccess();
                return ok;
              }}
              onForgotCode={onForgotCode}
            />
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelLabel}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 10px 40px rgba(43, 35, 64, 0.16)' },
  default: {
    shadowColor: '#2B2340',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(43, 35, 64, 0.42)',
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.background,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    ...cardShadow,
  },
  sheetTitle: {
    fontFamily: 'Fredoka_600SemiBold',
    fontSize: 20,
    color: colors.ink,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 13,
    color: colors.inkSoft,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 10,
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: 2,
  },
  cancelLabel: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 13,
    color: colors.purpleDark,
  },
});
