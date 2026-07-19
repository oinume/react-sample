import { useId } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';

export type LabeledFieldProps = TextInputProps & {
  label: string;
  error?: string;
  multiline?: boolean;
};

type ErrorAccessibilityProps = {
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
};

export function LabeledField({
  label,
  error,
  multiline = false,
  accessibilityLabel,
  placeholderTextColor,
  style,
  ...inputProps
}: LabeledFieldProps) {
  const { colors } = useAppTheme();
  const fieldId = useId();
  const errorId = `labeled-field-${fieldId}-error`;
  const callerAccessibilityProps = inputProps as TextInputProps & ErrorAccessibilityProps;
  const ariaDescribedBy = callerAccessibilityProps['aria-describedby'];
  const describedBy = error
    ? [ariaDescribedBy, errorId].filter((value) => value !== undefined).join(' ')
    : ariaDescribedBy;
  const errorAccessibilityProps: ErrorAccessibilityProps = {
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : callerAccessibilityProps['aria-invalid'],
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.ink }]}>{label}</Text>
      <TextInput
        {...inputProps}
        {...errorAccessibilityProps}
        accessibilityLabel={accessibilityLabel ?? label}
        multiline={multiline}
        placeholderTextColor={placeholderTextColor ?? colors.muted}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
          {
            backgroundColor: colors.paper,
            borderColor: error ? colors.danger : colors.line,
            color: colors.ink,
          },
          style,
        ]}
      />
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          nativeID={errorId}
          style={[styles.error, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multilineInput: {
    minHeight: 112,
    textAlignVertical: 'top',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
  },
});
