import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ValidatorForm } from '../components/ValidatorForm';

describe('<ValidatorForm />', () => {
  it('renders without crashing', () => {
    render(<ValidatorForm basePath="" profiles={new Map()} />);
  });

  it.skip('displays the name of the file that was uploaded', async () => {
    const { getByLabelText, queryByLabelText } = render(<ValidatorForm basePath="" profiles={new Map()} />);

    const fileInput = getByLabelText(/upload.*resource/i);
    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(queryByLabelText(/foobar\.json/)).toBeTruthy();
  });

  it.skip('disables textarea iff file is uploaded', async () => {
    const { getByLabelText } = render(<ValidatorForm basePath="" profiles={new Map()} />);

    const textField = getByLabelText(/paste.*resource/i);
    const fileInput = getByLabelText(/upload.*resource/i);

    expect(textField).toBeEnabled();

    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(textField).toBeDisabled();
  });
});
