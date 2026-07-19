export type Bookmark = {
  id: string;
  title: string;
  url: string;
  notes?: string;
  tags: string[];
  unread: boolean;
  savedAt: string;
};

export type BookmarkDraft = Pick<Bookmark, 'title' | 'url' | 'notes' | 'tags' | 'unread'>;

export type BookmarkFilter = {
  query?: string;
  tag?: string;
  unreadOnly?: boolean;
};

export type UrlValidationResult =
  | { ok: true; url: string }
  | { ok: false; message: string };
