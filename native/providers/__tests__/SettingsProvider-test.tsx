import { expect, it, jest } from '@jest/globals';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import {
  SettingsProvider,
  useSettings,
} from '@/providers/SettingsProvider';

it('updates session-only preferences', () => {
  let settings: ReturnType<typeof useSettings> | undefined;
  let tree: ReactTestRenderer | undefined;

  function Observer() {
    settings = useSettings();
    return null;
  }

  act(() => {
    tree = create(
      <SettingsProvider>
        <Observer />
      </SettingsProvider>,
    );
  });

  try {
    expect(settings).toMatchObject({
      openLinksInApp: true,
      appearance: 'system',
    });

    act(() => {
      settings!.setOpenLinksInApp(false);
    });
    act(() => {
      settings!.setAppearance('dark');
    });

    expect(settings).toMatchObject({
      openLinksInApp: false,
      appearance: 'dark',
    });
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('throws a useful error outside SettingsProvider', () => {
  function InvalidConsumer() {
    useSettings();
    return null;
  }

  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation((...args: unknown[]) => {
      const output = args.map(String).join(' ');
      if (!output.includes('useSettings must be used within SettingsProvider')) {
        throw new Error(`Unexpected console.error: ${output}`);
      }
    });

  try {
    expect(() => {
      act(() => {
        create(<InvalidConsumer />);
      });
    }).toThrow('useSettings must be used within SettingsProvider');
  } finally {
    consoleError.mockRestore();
  }
});
