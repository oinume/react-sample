import { expect, it, jest } from '@jest/globals';
import * as React from 'react';
import {
  act,
  create,
  type ReactTestRenderer,
} from 'react-test-renderer';

import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import {
  BookmarkProvider,
  useBookmarks,
} from '@/providers/BookmarkProvider';

it('provides records and supports bookmark interactions', () => {
  let api: ReturnType<typeof useBookmarks> | undefined;
  let tree: ReactTestRenderer | undefined;

  function Observer() {
    api = useBookmarks();
    return null;
  }

  act(() => {
    tree = create(
      <BookmarkProvider>
        <Observer />
      </BookmarkProvider>,
    );
  });

  try {
    expect(api?.bookmarks).toEqual(INITIAL_BOOKMARKS);

    const draftTags = ['Reference'];
    let id = '';
    act(() => {
      id = api!.addBookmark({
        title: 'New',
        url: 'https://example.com/',
        tags: draftTags,
        unread: true,
      });
    });

    const added = api?.getBookmark(id);
    expect(id).toBeTruthy();
    expect(Number.isNaN(Date.parse(added!.savedAt))).toBe(false);
    expect(added).toEqual(
      expect.objectContaining({
        id,
        title: 'New',
        url: 'https://example.com/',
        tags: ['Reference'],
        unread: true,
        savedAt: expect.any(String),
      }),
    );

    draftTags.push('Caller mutation');
    expect(api?.getBookmark(id)?.tags).toEqual(['Reference']);

    act(() => {
      api!.updateBookmark(id, { title: 'Updated' });
    });

    expect(api?.getBookmark(id)).toEqual({
      ...added,
      title: 'Updated',
    });

    act(() => {
      api!.markAsRead(id);
    });

    expect(api?.getBookmark(id)).toEqual({
      ...added,
      title: 'Updated',
      unread: false,
    });
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('does not retain a caller-owned tags array when updating', () => {
  let api: ReturnType<typeof useBookmarks> | undefined;
  let tree: ReactTestRenderer | undefined;

  function Observer() {
    api = useBookmarks();
    return null;
  }

  act(() => {
    tree = create(
      <BookmarkProvider>
        <Observer />
      </BookmarkProvider>,
    );
  });

  try {
    const updatedTags = ['Updated tag'];
    act(() => {
      api!.updateBookmark('expo-router', { tags: updatedTags });
    });

    updatedTags.push('Caller mutation');
    expect(api?.getBookmark('expo-router')?.tags).toEqual(['Updated tag']);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('preserves bookmarks identity for no-op updates', () => {
  let api: ReturnType<typeof useBookmarks> | undefined;
  let tree: ReactTestRenderer | undefined;

  function Observer() {
    api = useBookmarks();
    return null;
  }

  act(() => {
    tree = create(
      <BookmarkProvider>
        <Observer />
      </BookmarkProvider>,
    );
  });

  try {
    const initialBookmarks = api!.bookmarks;

    act(() => {
      api!.updateBookmark('missing', { title: 'Missing' });
    });
    expect(api!.bookmarks).toBe(initialBookmarks);

    act(() => {
      api!.markAsRead('missing');
    });
    expect(api!.bookmarks).toBe(initialBookmarks);

    act(() => {
      api!.markAsRead('native-stack');
    });
    expect(api!.bookmarks).toBe(initialBookmarks);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('throws a useful error outside BookmarkProvider', () => {
  function InvalidConsumer() {
    useBookmarks();
    return null;
  }

  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation((...args: unknown[]) => {
      const output = args.map(String).join(' ');
      if (!output.includes('useBookmarks must be used within BookmarkProvider')) {
        throw new Error(`Unexpected console.error: ${output}`);
      }
    });

  try {
    expect(() => {
      act(() => {
        create(<InvalidConsumer />);
      });
    }).toThrow('useBookmarks must be used within BookmarkProvider');
  } finally {
    consoleError.mockRestore();
  }
});
