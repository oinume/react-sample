import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { LabeledField } from '@/components/forms/LabeledField';
import { SheetScaffold } from '@/components/forms/SheetScaffold';
import { useAppTheme } from '@/hooks/useAppTheme';
import { normalizeHttpUrl } from '@/utils/bookmarks';

export default function AddUrlScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | undefined>();

  function closeSheet() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function changeUrl(value: string) {
    setUrl(value);
    if (error !== undefined) {
      setError(undefined);
    }
  }

  function continueToDetails() {
    const result = normalizeHttpUrl(url);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    router.replace({
      pathname: '/add-bookmark',
      params: { url: result.url },
    });
  }

  return (
    <SheetScaffold onClose={closeSheet} title="Add a URL">
      <View style={styles.intro}>
        <RouteStamp>FORM SHEET · STEP 1</RouteStamp>
        <Text style={[styles.instructions, { color: colors.muted }]}>
          Paste a bookmark URL or enter a domain to continue.
        </Text>
      </View>
      <LabeledField
        accessibilityLabel="Bookmark URL"
        autoCapitalize="none"
        autoCorrect={false}
        error={error}
        keyboardType="url"
        label="Bookmark URL"
        onChangeText={changeUrl}
        placeholder="https://example.com"
        value={url}
      />
      <Pressable
        accessibilityLabel="Continue"
        accessibilityRole="button"
        onPress={continueToDetails}
        style={[styles.continueButton, { backgroundColor: colors.accent }]}>
        <Text style={[styles.continueLabel, { color: colors.paper }]}>Continue</Text>
      </Pressable>
    </SheetScaffold>
  );
}

const styles = StyleSheet.create({
  intro: { alignItems: 'flex-start', gap: 8 },
  instructions: { fontSize: 15, lineHeight: 22 },
  continueButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 16,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 18,
  },
  continueLabel: { fontSize: 16, fontWeight: '800' },
});
