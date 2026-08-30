import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { SQLiteDatabase } from 'expo-sqlite';

import { PassCodeSheet } from '@/components/PassCodeSheet';
import { Checkbox } from '@/components/ui';
import { colors } from '@/constants/theme';
import { fonts, radii } from '@/constants/visual';
import { useGrownUpSession } from '@/context/GrownUpSessionContext';
import {
  getPasscodeGateEnabled,
  setPasscodeGateEnabled,
} from '@/lib/db/passcode-gate-settings';
import { deviceParentalGate } from '@/lib/device-parental-gate';
import { resetAppForForgottenCode } from '@/lib/reset-app';

type PasscodeGateSettingsProps = {
  db: SQLiteDatabase;
};

export function PasscodeGateSettings({ db }: PasscodeGateSettingsProps) {
  const router = useRouter();
  const { unlock } = useGrownUpSession();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);
  const [passCodeOpen, setPassCodeOpen] = useState(false);
  const [pendingEnabled, setPendingEnabled] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setEnabled(await getPasscodeGateEnabled(db));
  }, [db]);

  useEffect(() => {
    void load();
  }, [load]);

  const requestToggle = () => {
    if (enabled == null || saving) return;
    setPendingEnabled(!enabled);
    setPassCodeOpen(true);
  };

  const applyToggle = async () => {
    if (pendingEnabled == null) return;

    setSaving(true);
    try {
      await setPasscodeGateEnabled(db, pendingEnabled);
      setEnabled(pendingEnabled);
      if (!pendingEnabled) {
        unlock();
      }
    } finally {
      setSaving(false);
      setPendingEnabled(null);
    }
  };

  const closePassCode = () => {
    setPassCodeOpen(false);
    setPendingEnabled(null);
  };

  if (enabled == null) {
    return null;
  }

  return (
    <>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: enabled, disabled: saving }}
          accessibilityLabel="Require Pass Code for Settings"
          disabled={saving}
          onPress={requestToggle}
          style={styles.row}>
          <View style={styles.textWrap}>
            <Text style={styles.label}>Require Pass Code for Settings</Text>
            <Text style={styles.hint}>
              When off, ⚙️ opens Events without asking for a code.
            </Text>
          </View>
          <View pointerEvents="none">
            <Checkbox
              isSelected={enabled}
              variant="secondary"
              background={null}
              className="h-[26px] w-[26px] bg-surface"
              style={styles.checkbox}
            />
          </View>
        </Pressable>
      </View>

      <PassCodeSheet
        visible={passCodeOpen}
        subtitle="Enter your Pass Code to change this setting."
        onClose={closePassCode}
        onSubmit={(code) => deviceParentalGate.verify(code)}
        onSuccess={() => {
          setPassCodeOpen(false);
          void applyToggle();
        }}
        onForgotCode={async () => {
          await resetAppForForgottenCode(db, deviceParentalGate);
          closePassCode();
          router.replace('/setup');
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.settingsRow,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontFamily: fonts.body.extraBold,
    fontSize: 14,
    color: colors.ink,
  },
  hint: {
    fontFamily: fonts.body.semiBold,
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 17,
  },
  checkbox: {
    borderWidth: 2,
    borderColor: colors.purple,
  },
});
