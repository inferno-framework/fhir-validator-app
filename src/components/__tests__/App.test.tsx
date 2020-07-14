import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import { App } from '../App';

(global as any).fetch = jest.fn(() => Promise.resolve({
  json: () => Promise.resolve({}),
}));

describe('<App />', () => {
  it('renders without crashing', async () => {
    renderWithRouter(<App />);
    // fix act(...) warning: https://kentcdodds.com/blog/write-fewer-longer-tests#appendix
    await waitFor(() => {});
  });

  it('redirects users who manually navigate to the results page back to the home page', async () => {
    const { queryByText } = renderWithRouter(<App />, { route: '/validate' });
    await waitFor(() => expect(queryByText(/validated.*resource/i)).toBeFalsy());
  });

  it.todo('shows a 404 page if the user visits an invalid route');

  it('clears form state after an unmount', async () => {
    const { getByLabelText: getBefore, unmount, history } = renderWithRouter(<App />);
    const  textField = getBefore(/paste.*resource/i);

    expect(textField).toHaveValue('');
    fireEvent.change(textField, { target: { value: 'foobar' } });
    expect(textField).toHaveValue('foobar');

    // Clears form state after an unmount
    expect(unmount()).toBe(true);
    const { getByLabelText: getAfter } = renderWithRouter(<App />, { history });
    await waitFor(() => expect(getAfter(/paste.*resource/i)).toHaveValue(''));
  });

  it('routes to results page on form submit and restores state when going back', async () => {
    const { getByLabelText, getByDisplayValue, queryByText, history } = renderWithRouter(<App />);
    const textField = getByLabelText(/paste.*resource/i);
    const submitButton = getByDisplayValue(/validate/i);

    expect(queryByText(/validated.*resource/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: '{ "resourceType": "Patient" }' } });
    fireEvent.click(submitButton);

    // Reroutes to results page on form submit
    await waitFor(() => expect(queryByText(/validated.*resource/i)).toBeTruthy());

    // Restores form state when going back
    history.goBack();
    await waitFor(() => expect(queryByText(/validated.*resource/i)).toBeFalsy());
    expect(getByLabelText(/paste.*resource/i)).toHaveValue('{ "resourceType": "Patient" }');
  });

  it.todo('allows removing an uploaded file after going back in history');
});
