import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ResourceForm } from '../components/ResourceForm';

describe('<ResourceForm />', () => {
  it('renders without crashing', () => {
    render(<ResourceForm />);
  });

  it('associates the resource textarea with the label indicating to paste a resource', () => {
    const { getByLabelText } = render(<ResourceForm />);

    fireEvent.change(
      getByLabelText(/paste.*resource/i),
      { target: { value: 'hello' } },
    );
  });
});
