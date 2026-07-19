import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import type { Bookmark, BookmarkDraft } from '@/types/bookmark';

type BookmarkContextValue = {
  bookmarks: Bookmark[];
  addBookmark: (draft: BookmarkDraft) => string;
  updateBookmark: (id: string, changes: Partial<BookmarkDraft>) => void;
  markAsRead: (id: string) => void;
  getBookmark: (id: string) => Bookmark | undefined;
};

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function BookmarkProvider({ children }: PropsWithChildren) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    INITIAL_BOOKMARKS.map((bookmark) => ({
      ...bookmark,
      tags: [...bookmark.tags],
    })),
  );

  const addBookmark = useCallback((draft: BookmarkDraft) => {
    const id = `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const bookmark: Bookmark = {
      ...draft,
      tags: [...draft.tags],
      id,
      savedAt: new Date().toISOString(),
    };

    setBookmarks((current) => [bookmark, ...current]);
    return id;
  }, []);

  const updateBookmark = useCallback(
    (id: string, changes: Partial<BookmarkDraft>) => {
      const safeChanges =
        changes.tags === undefined
          ? changes
          : { ...changes, tags: [...changes.tags] };

      setBookmarks((current) => {
        if (!current.some((bookmark) => bookmark.id === id)) {
          return current;
        }

        return current.map((bookmark) =>
          bookmark.id === id ? { ...bookmark, ...safeChanges } : bookmark,
        );
      });
    },
    [],
  );

  const markAsRead = useCallback((id: string) => {
    setBookmarks((current) => {
      if (!current.some((bookmark) => bookmark.id === id && bookmark.unread)) {
        return current;
      }

      return current.map((bookmark) =>
        bookmark.id === id ? { ...bookmark, unread: false } : bookmark,
      );
    });
  }, []);

  const getBookmark = useCallback(
    (id: string) => bookmarks.find((bookmark) => bookmark.id === id),
    [bookmarks],
  );

  const value = useMemo(
    () => ({
      bookmarks,
      addBookmark,
      updateBookmark,
      markAsRead,
      getBookmark,
    }),
    [bookmarks, addBookmark, updateBookmark, markAsRead, getBookmark],
  );

  return (
    <BookmarkContext.Provider value={value}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks(): BookmarkContextValue {
  const context = useContext(BookmarkContext);

  if (context === null) {
    throw new Error('useBookmarks must be used within BookmarkProvider');
  }

  return context;
}
