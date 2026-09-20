import { useRef, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { PinInput, type PinInputHandle } from '@/components/PinInput';
import { ExpandableCard } from '@/components/ExpandableCard';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import {
  getParentalCodeLengthError,
  PARENTAL_CODE_MAX_LENGTH,
} from '@/lib/parental-gate';

export function ChangePasscodeCard() {
  const [expanded, setExpanded] = useState(false);
  const [currentCode, setCurrentCode] = useState('');
  const [newCode, setNewCode] = useState('');
  const [confirmCode, setConfirmCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const newPinRef = useRef<PinInputHandle>(null);
  const confirmPinRef = useRef<PinInputHandle>(null);

  const resetForm = () => {
    setCurrentCode('');
    setNewCode('');
    setConfirmCode('');
    setError(null);
  };

  const handleCurrentChange = (value: string) => {
    setCurrentCode(value);
    setError(null);
    if (value.length === PARENTAL_CODE_MAX_LENGTH) {
      newPinRef.current?.focus();
    }
  };

  const handleNewChange = (value: string) => {
    setNewCode(value);
    setError(null);
    if (value.length === PARENTAL_CODE_MAX_LENGTH) {
      confirmPinRef.current?.focus();
    }
  };

  const canSave =
    currentCode.length === PARENTAL_CODE_MAX_LENGTH &&
    newCode.length === PARENTAL_CODE_MAX_LENGTH &&
    confirmCode.length === PARENTAL_CODE_MAX_LENGTH &&
    !saving;

  const savePasscode = async () => {
    if (!canSave) return;

    const lengthError = getParentalCodeLengthError(newCode);
    if (lengthError) {
      setError(lengthError);
      return;
    }

    if (newCode !== confirmCode) {
      setError('New codes do not match.');
      return;
    }

    setSaving(true);
    try {
      const currentOk = await deviceParentalGate.verify(currentCode);
      if (!currentOk) {
        setError('Current Pass Code is not right.');
        return;
      }

      await deviceParentalGate.setCode(newCode);
      resetForm();
      setExpanded(false);
      Alert.alert('Pass Code updated', 'Use your new code whenever Settings is locked.');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not update your Pass Code.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ExpandableCard
      expanded={expanded}
      onHeaderPress={() => {
        setExpanded((open) => {
          if (open) resetForm();
          return !open;
        });
      }}
      accessibilityLabel="Passcode"
      style={styles.card}
      headerStyle={styles.cardHeader}
      header={
        <>
          <Text style={styles.cardTitle}>🔒 Passcode</Text>
          <Text style={styles.cardChevron}>{expanded ? '▾' : '▸'}</Text>
        </>
      }>
      <View style={styles.body}>
        <Text style={styles.hint}>
          Change the 4-digit code used when Settings is locked.
        </Text>

        <PinInput
          label="Current Pass Code"
          value={currentCode}
          length={PARENTAL_CODE_MAX_LENGTH}
          autoComplete="off"
          onChange={handleCurrentChange}
        />
        <PinInput
          ref={newPinRef}
          label="New Pass Code"
          value={newCode}
          length={PARENTAL_CODE_MAX_LENGTH}
          autoComplete="off"
          onChange={handleNewChange}
        />
        <PinInput
          ref={confirmPinRef}
          label="Type new code again"
          value={confirmCode}
          length={PARENTAL_CODE_MAX_LENGTH}
          autoComplete="off"
          onChange={(value) => {
            setConfirmCode(value);
            setError(null);
          }}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSave }}
          disabled={!canSave}
          onPress={() => void savePasscode()}
          style={({ pressed }) => [
            styles.saveButton,
            !canSave && styles.saveButtonDisabled,
            pressed && canSave && styles.saveButtonPressed,
          ]}>
          <Text style={styles.saveButtonLabel}>Update Pass Code</Text>
        </Pressable>
      </View>
    </ExpandableCard>
  );
}

const buttonShadow = Platform.select({
  web: { boxShadow: `0 4px 0 ${colors.purpleDark}` },
  default: {
    shadowColor: colors.purpleDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
});

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontFamily: fonts.body.extraBold,
    fontSize: 14,
    color: colors.ink,
  },
  cardChevron: {
    fontFamily: fonts.body.extraBold,
    fontSize: 16,
    color: colors.purpleDark,
    lineHeight: 18,
  },
  body: {
    gap: 16,
    paddingHorizontal: 14,
    paddingBottom: 16,
    paddingTop: 4,
  },
  hint: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  error: {
    fontFamily: fonts.body.bold,
    fontSize: 13,
    color: colors.pinkDark,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: colors.purple,
    borderRadius: radii.completeBtn,
    paddingVertical: 14,
    alignItems: 'center',
    ...buttonShadow,
  },
  saveButtonDisabled: {
    opacity: 0.45,
    ...Platform.select({
      web: { boxShadow: 'none' },
      default: { shadowOpacity: 0 },
    }),
  },
  saveButtonPressed: {
    transform: [{ translateY: 2 }],
  },
  saveButtonLabel: {
    fontFamily: fonts.heading.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});
