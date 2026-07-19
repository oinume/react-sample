import { FlatList, StyleSheet, Text, type ListRenderItemInfo } from 'react-native';

import { BookmarkCard } from '@/components/bookmarks/BookmarkCard';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Bookmark } from '@/types/bookmark';

export type BookmarkListProps = {
  bookmarks: Bookmark[];
  emptyMessage: string;
};

function keyExtractor(bookmark: Bookmark) {
  return bookmark.id;
}

function renderBookmark({ item }: ListRenderItemInfo<Bookmark>) {
  return <BookmarkCard bookmark={item} />;
}

export function BookmarkList({ bookmarks, emptyMessage }: BookmarkListProps) {
  const { colors } = useAppTheme();

  return (
    <FlatList
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      data={bookmarks}
      keyExtractor={keyExtractor}
      ListEmptyComponent={
        <Text style={[styles.emptyMessage, { color: colors.muted }]}>{emptyMessage}</Text>
      }
      renderItem={renderBookmark}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 12,
    padding: 16,
  },
  emptyMessage: {
    fontSize: 15,
    lineHeight: 22,
    paddingVertical: 32,
    textAlign: 'center',
  },
});
