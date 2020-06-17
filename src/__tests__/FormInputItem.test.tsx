import React, { useReducer } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import {
  FormInputItem,
  State,
  Action,
  reducer,
  initialState,
} from '../components/FormInputItem';

type TestState = { hello: State };

function testReducer({ hello }: TestState, action: Action): TestState {
  return { hello: reducer(hello, action) };
}

function WrappedInput({ validator } : { validator?: (input: string) => string }) {
  const [formState, dispatch] = useReducer(testReducer, { hello: initialState });

  return (
    <FormInputItem<TestState, 'hello'>
      name="hello"
      textLabel="foo"
      fileLabel="bar"
      state={formState.hello}
      context={dispatch}
      validator={validator}
    />
  );
}

describe('<FormInputItem />', () => {
  it('renders without crashing', () => {
    render(<WrappedInput />);
  });

  it('correctly associates labels with inputs and clears + disables text input after file upload', () => {
    const { getByLabelText, getByDisplayValue } = render(<WrappedInput />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');

    fireEvent.change(textField, { target: { value: 'hello' } });

    expect(getByDisplayValue('hello')).toBe(textField);
    expect(textField).toBeEnabled();
    expect(fileInput).toBeEnabled();

    const file = new File(['<World></World>'], 'world.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(getByLabelText(/world\.json/)).toBe(fileInput);
    expect(textField).toHaveValue('');
    expect(textField).toBeDisabled();
    expect(fileInput).toBeEnabled();
  });

  // validator used for test below
  function simpleValidator(input: string): string {
    const valid = /^yes|no$/i.test(input);
    return valid ? '' : 'you have entered invalid input';
  }

  it('correctly validates text input and only begins validation after user inputs text', () => {
    const { getByLabelText, queryByText } = render(<WrappedInput validator={simpleValidator} />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');
    const file = new File([], 'filename.json', { type: 'text/json' });

    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'hello' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: '   NOpe   ' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: 'yEs' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'no' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(queryByText(/invalid input/i)).toBeFalsy();
  });

  it('allows a file upload to be cancelled, re-enabling the text field', () => {
    const { getByLabelText, queryByLabelText } = render(<WrappedInput validator={simpleValidator} />);

    const textField = getByLabelText('foo');
    const fileInput = getByLabelText('bar');
    const file = new File([], 'filename.json', { type: 'text/json' });

    fireEvent.change(textField, { target: { value: 'hello' } });
    expect(textField).toHaveValue('hello');

    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(queryByLabelText(/filename\.json/i)).toBeTruthy();
    expect(textField).toBeDisabled();

    fireEvent.change(fileInput, { target: { files: [] } });
    expect(queryByLabelText(/filename\.json/i)).toBeFalsy();
    expect(textField).toBeEnabled();
  });
});
