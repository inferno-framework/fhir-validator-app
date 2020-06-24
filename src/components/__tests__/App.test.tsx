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
    expect(queryByText(/validated.*resource/i)).toBeFalsy();
    await waitFor(() => {});
  });

  it.todo('shows a 404 page if the user visits an invalid route');

  it('routes to results page on form submit and persist state when going back', async () => {
    const { getByLabelText, getByDisplayValue, queryByText, history } = renderWithRouter(<App />);
    const textField = getByLabelText(/paste.*resource/i);
    const submitButton = getByDisplayValue(/validate/i);

    expect(queryByText(/validated.*resource/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: '{ "resourceType": "Patient" }' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(queryByText(/validated.*resource/i)).toBeTruthy());

    history.goBack();

    await waitFor(() => expect(queryByText(/validated.*resource/i)).toBeFalsy());
    expect(getByLabelText(/paste.*resource/i)).toHaveValue('{ "resourceType": "Patient" }');
  });

  it('can use previous history to persist state after an unmount', async () => {
    const { getByLabelText: getBefore, unmount, history } = renderWithRouter(<App />);
    const  textField = getBefore(/paste.*resource/i);

    expect(textField).toHaveValue('');

    fireEvent.change(textField, { target: { value: 'foobar' } });
    expect(unmount()).toBe(true);

    const { getByLabelText: getAfter } = renderWithRouter(<App />, { history });

    expect(getAfter(/paste.*resource/i)).toHaveValue('foobar');
    await waitFor(() => {});
  });

  it.todo('allows removing an uploaded file after going back in history');
});
