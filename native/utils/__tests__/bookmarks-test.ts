import { describe, expect, it } from '@jest/globals';

import { INITIAL_BOOKMARKS } from '@/data/bookmarks';
import { filterBookmarks, getDisplayHost, normalizeHttpUrl } from '@/utils/bookmarks';

describe('normalizeHttpUrl', () => {
  it.each([
    ['https://docs.expo.dev/router/introduction/', 'https://docs.expo.dev/router/introduction/'],
    ['http://example.com/path', 'http://example.com/path'],
    ['  expo.dev  ', 'https://expo.dev/'],
    ['example.com:8080/path', 'https://example.com:8080/path'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeHttpUrl(input)).toEqual({ ok: true, url: expected });
  });

  it.each(['', 'ftp://expo.dev', 'https://', 'not a host'])('rejects %s', (input) => {
    expect(normalizeHttpUrl(input)).toEqual({
      ok: false,
      message: 'Enter a valid HTTP or HTTPS URL.',
    });
  });

  it('returns a fresh validation failure', () => {
    expect(normalizeHttpUrl('')).not.toBe(normalizeHttpUrl('https://'));
  });
});

describe('filterBookmarks', () => {
  it('filters unread records', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { unreadOnly: true })).toHaveLength(4);
  });

  it('matches titles case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'THINKING IN REACT' }).map((item) => item.id)).toEqual([
      'react-docs',
    ]);
  });

  it('matches URLs case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'DESIGNBETTER.CO' }).map((item) => item.id)).toEqual([
      'design-systems',
    ]);
  });

  it('matches notes case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'EMBEDDED BROWSER REFERENCE' }).map((item) => item.id)).toEqual([
      'webview',
    ]);
  });

  it('matches tags case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'DEVELOPMENT' }).map((item) => item.id)).toEqual([
      'expo-router',
      'native-stack',
      'webview',
      'react-docs',
      'accessibility',
    ]);
  });

  it('matches navigation case-insensitively', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { query: 'NAVIGATION' }).map((item) => item.id)).toEqual([
      'expo-router',
      'native-stack',
    ]);
  });

  it('matches a tag exactly', () => {
    expect(filterBookmarks(INITIAL_BOOKMARKS, { tag: 'React Native' }).map((item) => item.id)).toEqual([
      'expo-router',
      'native-stack',
      'webview',
      'accessibility',
    ]);
  });

  it('combines query, tag, and unread filters with AND semantics', () => {
    expect(
      filterBookmarks(INITIAL_BOOKMARKS, {
        query: 'react',
        tag: 'React Native',
        unreadOnly: true,
      }).map((item) => item.id),
    ).toEqual(['expo-router', 'webview', 'accessibility']);
  });
});

describe('getDisplayHost', () => {
  it('extracts a readable host', () => {
    expect(getDisplayHost('https://docs.expo.dev/router/')).toBe('docs.expo.dev');
  });

  it('strips a leading www', () => {
    expect(getDisplayHost('https://www.example.com/path')).toBe('example.com');
  });

  it('returns malformed input unchanged', () => {
    expect(getDisplayHost('not a url')).toBe('not a url');
  });
});
