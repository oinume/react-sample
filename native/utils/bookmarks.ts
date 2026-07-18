import type { Bookmark, BookmarkFilter, UrlValidationResult } from '@/types/bookmark';

function invalidUrlResult(): UrlValidationResult {
  return { ok: false, message: 'Enter a valid HTTP or HTTPS URL.' };
}

export function normalizeHttpUrl(rawValue: string): UrlValidationResult {
  const value = rawValue.trim();
  if (!value) {
    return invalidUrlResult();
  }

  const hasExplicitScheme = /^[a-z][a-z\d+.-]*:(?!\d+(?:[/?#]|$))/i.test(value);
  const candidate = hasExplicitScheme ? value : `https://${value}`;

  try {
    const url = new URL(candidate);
    if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || !url.hostname.includes('.')) {
      return invalidUrlResult();
    }

    return { ok: true, url: url.toString() };
  } catch {
    return invalidUrlResult();
  }
}

export function filterBookmarks(bookmarks: Bookmark[], filter: BookmarkFilter): Bookmark[] {
  const query = filter.query?.trim().toLocaleLowerCase() ?? '';

  return bookmarks.filter((bookmark) => {
    const searchable = [bookmark.title, bookmark.url, bookmark.notes ?? '', ...bookmark.tags]
      .join(' ')
      .toLocaleLowerCase();

    return (
      (!filter.unreadOnly || bookmark.unread) &&
      (!filter.tag || bookmark.tags.includes(filter.tag)) &&
      (!query || searchable.includes(query))
    );
  });
}

export function getDisplayHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
