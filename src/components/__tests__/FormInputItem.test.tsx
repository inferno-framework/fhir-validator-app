import React, { useReducer, ReactElement } from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { FormInputItem, State, Action, reducer, initialState } from '../FormInputItem';

type TestState = { hello: State };

const testValidator = (input: string): string => {
  const valid = /^yes|no$/i.test(input);
  return valid ? '' : 'you have entered invalid input';
};

const testReducer = ({ hello }: TestState, action: Action): TestState => ({
  hello: reducer(hello, action),
});

const TestFormInputItem = (): ReactElement => (
  <FormInputItem
    name="hello"
    textLabel="foo"
    fileLabel="bar"
    validator={testValidator}
    context={useReducer(testReducer, { hello: initialState })}
  />
);

describe('<FormInputItem />', () => {
  it('renders without crashing', () => {
    render(<TestFormInputItem />);
  });

  it('correctly associates labels with inputs and clears + disables text input after file upload', async () => {
    const { getByLabelText, getByDisplayValue } = render(<TestFormInputItem />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');

    fireEvent.change(textField, { target: { value: 'hello' } });

    expect(getByDisplayValue('hello')).toBe(textField);
    expect(textField).toBeEnabled();
    expect(fileInput).toBeEnabled();

    const file = new File([], 'world.json', {});
    file.text = (): Promise<string> => Promise.resolve('');
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(getByLabelText(/world\.json/)).toBe(fileInput));
    expect(textField).toHaveValue('');
    expect(textField).toBeDisabled();
    expect(fileInput).toBeEnabled();
  });

  it('correctly validates text input and only begins validation after user inputs text', async () => {
    const { getByLabelText, queryByText } = render(<TestFormInputItem />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');

    const validFile = new File(['YES'], 'valid.txt', {});
    validFile.text = (): Promise<string> => Promise.resolve('YES');
    const invalidFile = new File(['nooo'], 'invalid.txt', {});
    invalidFile.text = (): Promise<string> => Promise.resolve('nooo');

    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'hello' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: '   NOpe   ' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: 'yEs' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'no' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(fileInput, { target: { files: [validFile] } });
    await waitFor(() => expect(queryByText(/invalid input/i)).toBeFalsy());

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    await waitFor(() => expect(queryByText(/invalid input/i)).toBeTruthy());
  });

  it('allows a file upload to be cancelled, re-enabling the text field', async () => {
    const { getByLabelText, getByText, queryByLabelText } = render(<TestFormInputItem />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');
    const file = new File([], 'filename.txt', {});
    file.text = (): Promise<string> => Promise.resolve('');

    fireEvent.change(textField, { target: { value: 'hello' } });
    expect(textField).toHaveValue('hello');

    fireEvent.change(fileInput, { target: { files: [file] } });
    await waitFor(() => expect(queryByLabelText(/filename\.txt/i)).toBeTruthy());
    expect(textField).toBeDisabled();

    fireEvent.click(getByText(/remove/i));
    expect(queryByLabelText(/filename\.txt/i)).toBeFalsy();
    expect(textField).toBeEnabled();
  });
});
