import React, { useReducer } from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { FormInputItem } from '../components/FormInputItem';
import { FormContext, formReducer } from '../components/ValidatorForm';

function WrappedInput({ validator } : { validator?: (input: string) => string }) {
  const [formState, dispatch] = useReducer(formReducer, {
    resource: { type: 'input', input: '', error: '' },
    profile: { type: 'input', input: '', error: '' },
  });

  return (
    <FormContext.Provider value={dispatch}>
      <FormInputItem
        name="resource"
        textLabel="foo"
        fileLabel="bar"
        state={formState.resource}
        validator={validator}
      />
    </FormContext.Provider>
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

    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'hello' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: '   NOpe   ' } });
    expect(queryByText(/invalid input/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: 'yEs' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: 'no' } });
    expect(queryByText(/invalid input/i)).toBeFalsy();

    const file = new File([''], 'anything.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(queryByText(/invalid input/i)).toBeFalsy();
  });
});
