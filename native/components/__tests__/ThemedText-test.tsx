import { expect, it } from '@jest/globals';
import * as React from 'react';
import renderer, { act, type ReactTestRenderer } from 'react-test-renderer';

import { ThemedText } from '../ThemedText';

it(`renders correctly`, async () => {
  let component: ReactTestRenderer | undefined;

  await act(async () => {
    component = renderer.create(<ThemedText>Snapshot test!</ThemedText>);
  });

  expect(component?.toJSON()).toMatchSnapshot();
});
