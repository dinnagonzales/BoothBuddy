import { useCallback, useState } from 'react';
import {
  Platform,
  TextInput,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
} from 'react-native';

import { colors } from '@/constants/theme';
import { BrandInput } from '@/components/ui/BrandInput';
import { EmojiPickerModal } from '@/components/ui/EmojiPickerModal';

type IconInputProps = Omit<TextInputProps, 'onFocus' | 'showSoftInputOnFocus'> & {
  value: string;
  onChangeText: (value: string) => void;
  style?: StyleProp<TextStyle>;
  /** Use BrandInput styling (default). Pass false for caller-provided styles only. */
  branded?: boolean;
};

/** Single-character icon field — opens an emoji picker sheet on tap/focus. */
export function IconInput({
  value,
  onChangeText,
  style,
  branded = true,
  ...props
}: IconInputProps) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const usesPickerSheet = Platform.OS !== 'web';

  const openPicker = useCallback(() => {
    if (!usesPickerSheet) return;
    setPickerVisible(true);
  }, [usesPickerSheet]);

  const handleFocus = useCallback(() => {
    openPicker();
  }, [openPicker]);

  const inputProps: TextInputProps = {
    value,
    onChangeText,
    onFocus: handleFocus,
    showSoftInputOnFocus: !usesPickerSheet,
    placeholderTextColor: colors.inkSoft,
    style,
    ...props,
  };

  const input = branded ? <BrandInput {...inputProps} /> : <TextInput {...inputProps} />;

  if (!usesPickerSheet) {
    return input;
  }

  return (
    <>
      {input}
      <EmojiPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={onChangeText}
      />
    </>
  );
}
