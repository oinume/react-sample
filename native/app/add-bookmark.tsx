import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';

import { EmptyState } from '@/components/bookmarks/EmptyState';
import { RouteStamp } from '@/components/bookmarks/RouteStamp';
import { LabeledField } from '@/components/forms/LabeledField';
import { SheetScaffold } from '@/components/forms/SheetScaffold';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useBookmarks } from '@/providers/BookmarkProvider';
import type { Bookmark, BookmarkDraft } from '@/types/bookmark';
import { getDisplayHost, normalizeHttpUrl } from '@/utils/bookmarks';

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function AddBookmarkScreen() {
  const params = useLocalSearchParams<{ id?: string | string[]; url?: string | string[] }>();
  const router = useRouter();
  const { getBookmark } = useBookmarks();
  const id = firstParam(params.id);
  const existing = id ? getBookmark(id) : undefined;

  const close = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  if (id && !existing) {
    return (
      <SheetScaffold onClose={close} title="Edit bookmark">
        <EmptyState
          actionLabel="Back to home"
          message="This bookmark may have been removed or is no longer available."
          onAction={() => router.replace('/')}
          title="Bookmark not found"
        />
      </SheetScaffold>
    );
  }

  if (existing) {
    return (
      <BookmarkForm
        key={`edit:${id}`}
        existing={existing}
        onClose={close}
        url={existing.url}
      />
    );
  }

  const validatedUrl = normalizeHttpUrl(firstParam(params.url));
  if (!validatedUrl.ok) {
    return (
      <SheetScaffold onClose={close} title="Save bookmark">
        <EmptyState
          actionLabel="Back to home"
          message="Add a valid HTTP or HTTPS URL before saving this bookmark."
          onAction={() => router.replace('/')}
          title="Invalid bookmark URL"
        />
      </SheetScaffold>
    );
  }

  return (
    <BookmarkForm
      key={`create:${validatedUrl.url}`}
      onClose={close}
      url={validatedUrl.url}
    />
  );
}

type BookmarkFormProps = {
  existing?: Bookmark;
  onClose: () => void;
  url: string;
};

function BookmarkForm({ existing, onClose, url }: BookmarkFormProps) {
  const { addBookmark, updateBookmark } = useBookmarks();
  const { colors } = useAppTheme();
  const [title, setTitle] = useState(() => existing?.title ?? getDisplayHost(url));
  const [notes, setNotes] = useState(() => existing?.notes ?? '');
  const [tags, setTags] = useState(() => existing?.tags.join(', ') ?? '');
  const [unread, setUnread] = useState(() => existing?.unread ?? true);

  const save = () => {
    const draft: BookmarkDraft = {
      title: title.trim(),
      url,
      notes: notes.trim() || undefined,
      tags: tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      unread,
    };

    if (existing) {
      updateBookmark(existing.id, draft);
    } else {
      addBookmark(draft);
    }
    onClose();
  };

  return (
    <SheetScaffold
      onClose={onClose}
      onSave={save}
      saveDisabled={!title.trim() || !url}
      saveLabel={existing ? 'Save changes' : 'Save bookmark'}
      title={existing ? 'Edit bookmark' : 'Save bookmark'}>
      <RouteStamp>{existing ? 'FORM SHEET · EDIT' : 'FORM SHEET · STEP 2'}</RouteStamp>
      <View style={styles.urlBlock}>
        <Text style={[styles.label, { color: colors.ink }]}>URL</Text>
        <Text
          accessibilityLabel="Bookmark URL"
          selectable
          style={[
            styles.url,
            { backgroundColor: colors.paper, borderColor: colors.line, color: colors.muted },
          ]}>
          {url}
        </Text>
      </View>
      <LabeledField label="Title" onChangeText={setTitle} value={title} />
      <LabeledField label="Notes" multiline onChangeText={setNotes} value={notes} />
      <LabeledField
        autoCapitalize="none"
        autoCorrect={false}
        label="Tags (comma-separated)"
        onChangeText={setTags}
        value={tags}
      />
      <View style={[styles.switchRow, { backgroundColor: colors.paper, borderColor: colors.line }]}>
        <Text style={[styles.switchLabel, { color: colors.ink }]}>Keep unread</Text>
        <Switch
          accessibilityLabel="Keep unread"
          onValueChange={setUnread}
          thumbColor={colors.paper}
          trackColor={{ false: colors.line, true: colors.accent }}
          value={unread}
        />
      </View>
    </SheetScaffold>
  );
}

const styles = StyleSheet.create({
  urlBlock: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
  },
  url: {
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  switchRow: {
    alignItems: 'center',
    borderCurve: 'continuous',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
});
