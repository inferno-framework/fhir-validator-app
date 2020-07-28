import React from 'react';
import { render, RenderResult } from '@testing-library/react';

import { Resource, ResourceProps } from '../Resource';

function renderResource(props: Partial<ResourceProps> = {}): RenderResult {
  const defaultProps: ResourceProps = {
    resource: '{ "foo": "bar"}',
    contentType: 'json',
    errors: [],
    warnings: [],
    information: [],
  };
  return render(<Resource {...defaultProps} {...props} />);
}

describe('<Resource />', () => {
  test('Should display a simple JSON object', () => {
    const { getByTestId } = renderResource();
    const resource = getByTestId('syntax-highlight');

    expect(resource).toHaveTextContent(/foo/);
    expect(resource).toHaveTextContent(/bar/);
  });
});
