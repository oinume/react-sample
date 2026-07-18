import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView,
  type WebViewNavigation,
} from 'react-native-webview';

import { EmptyState } from '@/components/bookmarks/EmptyState';
import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBookmarks } from '@/providers/BookmarkProvider';
import type { Bookmark } from '@/types/bookmark';
import { getDisplayHost } from '@/utils/bookmarks';

type ToolbarButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accent: string;
  background: string;
  border: string;
  muted: string;
};

function ToolbarButton({
  label,
  onPress,
  disabled = false,
  accent,
  background,
  border,
  muted,
}: ToolbarButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[styles.toolbarButton, { backgroundColor: background, borderColor: border }]}>
      <Text style={[styles.toolbarLabel, { color: disabled ? muted : accent }]}>{label}</Text>
    </Pressable>
  );
}

function normalizeId(value: string | string[] | undefined): string {
  const firstValue = Array.isArray(value) ? value[0] : value;
  return firstValue || '';
}

export default function BrowserScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const { getBookmark, markAsRead } = useBookmarks();
  const { colors } = useAppTheme();
  const id = normalizeId(params.id);
  const bookmark = getBookmark(id);

  useEffect(() => {
    if (id) {
      markAsRead(id);
    }
  }, [id, markAsRead]);

  if (bookmark === undefined) {
    return (
      <SafeAreaView
        edges={['top', 'bottom']}
        style={[styles.emptyScreen, { backgroundColor: colors.canvas }]}>
        <EmptyState
          actionLabel="Back to home"
          message="This bookmark is no longer available."
          onAction={() => router.replace('/')}
          title="Bookmark not found"
        />
      </SafeAreaView>
    );
  }

  return <BrowserView key={`${bookmark.id}:${bookmark.url}`} bookmark={bookmark} />;
}

type BrowserViewProps = {
  bookmark: Bookmark;
};

function BrowserView({ bookmark }: BrowserViewProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [currentUrl, setCurrentUrl] = useState(bookmark.url);
  const source = useMemo(() => ({ uri: bookmark.url }), [bookmark.url]);

  function closeBrowser() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }

  function updateNavigation(navigation: WebViewNavigation) {
    setCanGoBack(navigation.canGoBack);
    setCanGoForward(navigation.canGoForward);
    setLoading(navigation.loading);
    setCurrentUrl(navigation.url);
  }

  function retry() {
    setError(undefined);
    setLoading(true);
    webViewRef.current?.reload();
  }

  async function shareBookmark() {
    try {
      await Share.share({
        title: bookmark.title,
        message: currentUrl,
        url: currentUrl,
      });
    } catch {
      Alert.alert('Share failed', 'Unable to share this bookmark.');
    }
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.canvas }]}>
      <SafeAreaView edges={['top']} style={[styles.topBar, { borderBottomColor: colors.line }]}>
        <Pressable
          accessibilityLabel="Close browser"
          accessibilityRole="button"
          onPress={closeBrowser}
          style={[styles.closeButton, { backgroundColor: colors.paper, borderColor: colors.line }]}>
          <Text style={[styles.closeLabel, { color: colors.accent }]}>Close</Text>
        </Pressable>
        <View style={styles.location}>
          <Text numberOfLines={1} style={[styles.host, { color: colors.ink }]}>
            {getDisplayHost(currentUrl)}
          </Text>
          <RouteStamp>STACK → WEB HISTORY</RouteStamp>
        </View>
      </SafeAreaView>

      <View style={styles.webContainer}>
        <WebView
          ref={webViewRef}
          onError={({ nativeEvent }) => {
            setCanGoBack(nativeEvent.canGoBack);
            setCanGoForward(nativeEvent.canGoForward);
            setCurrentUrl(nativeEvent.url);
            setLoading(false);
            setError('Page could not be loaded');
          }}
          onLoadEnd={() => setLoading(false)}
          onLoadStart={() => {
            setError(undefined);
            setLoading(true);
          }}
          onNavigationStateChange={updateNavigation}
          source={source}
          style={styles.webView}
        />
        {loading ? (
          <View
            accessibilityLabel="Page loading"
            accessibilityRole="progressbar"
            pointerEvents="none"
            style={[styles.overlay, { backgroundColor: colors.canvas }]}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
        ) : null}
        {error !== undefined ? (
          <View
            accessibilityLiveRegion="assertive"
            style={[styles.overlay, styles.errorOverlay, { backgroundColor: colors.canvas }]}>
            <Text accessibilityRole="alert" style={[styles.errorTitle, { color: colors.ink }]}>
              Page could not be loaded
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.errorUrl, { color: colors.muted }]}>
              {currentUrl}
            </Text>
            <Pressable
              accessibilityLabel="Retry"
              accessibilityRole="button"
              onPress={retry}
              style={[styles.retryButton, { backgroundColor: colors.accent }]}>
              <Text style={[styles.retryLabel, { color: colors.paper }]}>Retry</Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      <SafeAreaView edges={['bottom']} style={[styles.bottomBar, { borderTopColor: colors.line }]}>
        <ScrollView
          contentContainerStyle={styles.toolbar}
          horizontal={true}
          showsHorizontalScrollIndicator={false}>
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            label="App back"
            muted={colors.muted}
            onPress={closeBrowser}
          />
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            label="Edit bookmark"
            muted={colors.muted}
            onPress={() =>
              router.push({ pathname: '/add-bookmark', params: { id: bookmark.id } })
            }
          />
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            label="Share"
            muted={colors.muted}
            onPress={shareBookmark}
          />
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            label="Reload"
            muted={colors.muted}
            onPress={() => webViewRef.current?.reload()}
          />
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            disabled={!canGoBack}
            label="Web back"
            muted={colors.muted}
            onPress={() => webViewRef.current?.goBack()}
          />
          <ToolbarButton
            accent={colors.accent}
            background={colors.paper}
            border={colors.line}
            disabled={!canGoForward}
            label="Web forward"
            muted={colors.muted}
            onPress={() => webViewRef.current?.goForward()}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  emptyScreen: { flex: 1, justifyContent: 'center' },
  topBar: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  closeButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 14,
  },
  closeLabel: { fontSize: 14, fontWeight: '800' },
  location: { alignItems: 'flex-start', flex: 1, gap: 5 },
  host: { fontSize: 15, fontWeight: '700', maxWidth: '100%' },
  webContainer: { flex: 1 },
  webView: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOverlay: { gap: 12, padding: 24 },
  errorTitle: { fontSize: 19, fontWeight: '800', textAlign: 'center' },
  errorUrl: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
  retryButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 18,
  },
  retryLabel: { fontSize: 15, fontWeight: '800' },
  bottomBar: { borderTopWidth: 1 },
  toolbar: { gap: 8, paddingHorizontal: 12, paddingVertical: 8 },
  toolbarButton: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 13,
  },
  toolbarLabel: { fontSize: 13, fontWeight: '700' },
});
