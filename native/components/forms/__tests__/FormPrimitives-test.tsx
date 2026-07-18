import { expect, it, jest } from '@jest/globals';
import * as React from 'react';
import { Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { LabeledField } from '@/components/forms/LabeledField';
import { SheetScaffold } from '@/components/forms/SheetScaffold';
import { Theme } from '@/constants/Theme';

jest.mock('@/hooks/useAppTheme', () => {
  const { Theme } = jest.requireActual<typeof import('@/constants/Theme')>('@/constants/Theme');

  return {
    useAppTheme: () => ({ scheme: 'light', colors: Theme.light }),
  };
});

it('labels a multiline field, shows its error, and forwards input props', () => {
  const onChangeText = jest.fn();
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(
      <LabeledField
        error="Notes are required."
        label="Notes"
        multiline={true}
        onChangeText={onChangeText}
        value="Draft note"
      />,
    );
  });

  try {
    expect(tree!.root.findByProps({ children: 'Notes' })).toBeTruthy();
    const error = tree!.root.findByProps({ children: 'Notes are required.' });
    expect(error.props.nativeID).toEqual(expect.any(String));

    const input = tree!.root.findByProps({ accessibilityLabel: 'Notes' });
    expect(input.props['aria-invalid']).toBe(true);
    expect(input.props['aria-describedby']).toBe(error.props.nativeID);
    expect(input.props.value).toBe('Draft note');
    expect(input.props.multiline).toBe(true);

    act(() => {
      input.props.onChangeText('Updated note');
    });
    expect(onChangeText).toHaveBeenCalledWith('Updated note');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('preserves caller-provided input accessibility and placeholder colors', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(
      <LabeledField
        accessibilityLabel="Custom field label"
        label="Title"
        placeholderTextColor="custom-placeholder"
      />,
    );
  });

  try {
    const input = tree!.root.findByProps({ accessibilityLabel: 'Custom field label' });
    expect(input.props.placeholderTextColor).toBe('custom-placeholder');
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('uses the muted placeholder color and omits error metadata without an error', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(<LabeledField label="Title" />);
  });

  try {
    const input = tree!.root.findByProps({ accessibilityLabel: 'Title' });
    expect(input.props.placeholderTextColor).toBe(Theme.light.muted);
    expect(input.props['aria-invalid']).toBeUndefined();
    expect(input.props['aria-describedby']).toBeUndefined();
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('renders sheet actions and invokes their Pressable handlers', () => {
  const onClose = jest.fn();
  const onSave = jest.fn();
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(
      <SheetScaffold onClose={onClose} onSave={onSave} saveLabel="Keep changes" title="Edit">
        <Text>Form body</Text>
      </SheetScaffold>,
    );
  });

  try {
    const title = tree!.root.findByProps({ children: 'Edit' });
    expect(title.props.accessibilityRole).toBe('header');
    expect(tree!.root.findByProps({ children: 'Form body' })).toBeTruthy();

    const close = tree!.root.findByProps({ accessibilityLabel: 'Close' });
    const save = tree!.root.findByProps({ accessibilityLabel: 'Keep changes' });
    act(() => {
      close.props.onPress();
      save.props.onPress();
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('keeps the fixed sheet header inside the top safe area', () => {
  let tree: ReactTestRenderer | undefined;

  act(() => {
    tree = create(<SheetScaffold onClose={jest.fn()} title="Edit" />);
  });

  try {
    const safeArea = tree!.root.findByType(SafeAreaView);
    expect(safeArea.props.edges).toEqual(['top']);
  } finally {
    act(() => {
      tree?.unmount();
    });
  }
});

it('marks a disabled save action and omits it when no save callback exists', () => {
  let disabledTree: ReactTestRenderer | undefined;
  let closeOnlyTree: ReactTestRenderer | undefined;

  act(() => {
    disabledTree = create(
      <SheetScaffold onClose={jest.fn()} onSave={jest.fn()} saveDisabled={true} title="Add" />,
    );
    closeOnlyTree = create(<SheetScaffold onClose={jest.fn()} title="Add" />);
  });

  try {
    const save = disabledTree!.root.findByProps({ accessibilityLabel: 'Save' });
    expect(save.props.disabled).toBe(true);
    expect(save.props.accessibilityState).toEqual({ disabled: true });
    expect(closeOnlyTree!.root.findAllByProps({ accessibilityLabel: 'Save' })).toHaveLength(0);
  } finally {
    act(() => {
      disabledTree?.unmount();
      closeOnlyTree?.unmount();
    });
  }
});
