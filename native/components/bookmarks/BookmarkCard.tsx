import { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Bookmark } from '@/types/bookmark';
import { getDisplayHost } from '@/utils/bookmarks';

export type BookmarkCardProps = {
  bookmark: Bookmark;
};

export const BookmarkCard = memo(function BookmarkCard({ bookmark }: BookmarkCardProps) {
  const router = useRouter();
  const { colors } = useAppTheme();
  const openBookmark = useCallback(() => {
    router.push({ pathname: '/browser', params: { id: bookmark.id } });
  }, [bookmark.id, router]);
  const cardStyle = useMemo(
    () => [
      styles.card,
      {
        backgroundColor: colors.paper,
        borderColor: colors.line,
        boxShadow: `0 6px 20px ${colors.ink}1A`,
      },
    ],
    [colors.ink, colors.line, colors.paper],
  );
  const visibleTags = useMemo(() => Array.from(new Set(bookmark.tags)), [bookmark.tags]);

  return (
    <Pressable
      accessibilityHint={bookmark.unread ? 'Unread bookmark' : undefined}
      accessibilityLabel={`Open ${bookmark.title}`}
      accessibilityRole="button"
      onPress={openBookmark}
      style={cardStyle}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.ink }]}>{bookmark.title}</Text>
        {bookmark.unread ? (
          <View
            accessible={false}
            style={[styles.unreadDot, { backgroundColor: colors.accent }]}
          />
        ) : null}
      </View>
      <Text style={[styles.host, { color: colors.muted }]}>{getDisplayHost(bookmark.url)}</Text>
      <View style={styles.tags}>
        {visibleTags.map((tag) => (
          <Text
            key={tag}
            style={[
              styles.tag,
              {
                backgroundColor: colors.canvas,
                borderColor: colors.line,
                color: colors.accent,
              },
            ]}>
            {tag}
          </Text>
        ))}
      </View>
      <RouteStamp>STACK → WEBVIEW</RouteStamp>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderCurve: 'continuous',
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    minHeight: 44,
    padding: 16,
  },
  heading: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 10,
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 23,
  },
  unreadDot: {
    borderCurve: 'continuous',
    borderRadius: 5,
    height: 10,
    marginTop: 6,
    width: 10,
  },
  host: {
    fontSize: 14,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    borderCurve: 'continuous',
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 12,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
});
