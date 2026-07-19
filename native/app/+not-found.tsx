import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.safeArea, { backgroundColor: colors.canvas }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic">
        <RouteStamp>STACK FALLBACK</RouteStamp>
        <View style={styles.messageBlock}>
          <Text accessibilityRole="header" style={[styles.title, { color: colors.ink }]}>
            Route not found
          </Text>
          <Text style={[styles.message, { color: colors.muted }]}>
            This navigation example does not include that route.
          </Text>
          <Pressable
            accessibilityLabel="Back to bookmarks"
            accessibilityRole="button"
            onPress={() => router.replace('/')}
            style={[styles.action, { backgroundColor: colors.accent }]}>
            <Text style={[styles.actionLabel, { color: colors.paper }]}>Back to bookmarks</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    gap: 20,
    justifyContent: 'center',
    padding: 24,
  },
  messageBlock: {
    alignItems: 'center',
    gap: 12,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  action: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
});
