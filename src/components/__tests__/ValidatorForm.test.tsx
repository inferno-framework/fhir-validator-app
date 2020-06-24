import React from 'react';
import { renderWithRouter } from '../test-utils';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import { ValidatorForm } from '../ValidatorForm';

describe('<ValidatorForm />', () => {
  it('renders without crashing', () => {
    renderWithRouter(<ValidatorForm basePath="" profiles={{}} />);
  });

  it('handles optional arguments without crashing', () => {
    renderWithRouter(<ValidatorForm basePath="" />);
    renderWithRouter(<ValidatorForm profiles={{}} />);
    renderWithRouter(<ValidatorForm />);
  });

  it('displays the name of the file that was uploaded', () => {
    const { getByLabelText, queryByLabelText } = renderWithRouter(<ValidatorForm />);

    const fileInput = getByLabelText(/upload.*resource/i);
    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(queryByLabelText(/foobar\.json/)).toBeTruthy();
  });

  it('disables textarea iff file is uploaded', () => {
    const { getByLabelText } = renderWithRouter(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);
    const fileInput = getByLabelText(/upload.*resource/i);

    expect(textField).toBeEnabled();

    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(textField).toBeDisabled();
  });

  it('can detect valid/invalid JSON and report missing "resourceType"', () => {
    const { getByLabelText, queryByText } = renderWithRouter(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);

    expect(queryByText(/invalid.*JSON/i)).toBeFalsy();
    expect(queryByText(/missing.*resourceType/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: `{ "trailingComma": true, }` } });
    expect(queryByText(/invalid.*JSON/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ 'singleQuotes': true }` } });
    expect(queryByText(/invalid.*JSON/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ "validJson": true, "resourceTypePresent": false }` } });
    expect(queryByText(/missing.*resourceType/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ "resourceType": "Patient" }` } });
    expect(queryByText(/invalid.*JSON/i)).toBeFalsy();
    expect(queryByText(/missing.*resourceType/i)).toBeFalsy();
  });

  it('can detect valid/invalid XML and report missing xmlns', () => {
    const { getByLabelText, queryByText } = renderWithRouter(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);

    expect(queryByText(/invalid.*XML/i)).toBeFalsy();
    expect(queryByText(/missing.*xmlns/i)).toBeFalsy();

    fireEvent.change(textField, { target: { value: `<NoEndTag>` } });
    expect(queryByText(/invalid.*XML/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<MisplacedAttribute></MisplacedAttribute here="not good">` } });
    expect(queryByText(/invalid.*XML/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<ValidXML></ValidXML>` } });
    expect(queryByText(/missing.*xmlns/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<IncorrectNS xmlns="wrong"></IncorrectNS>` } });
    expect(queryByText(/missing.*xmlns/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<MedicationRequest xmlns="http://hl7.org/fhir"></MedicationRequest>` } });
    expect(queryByText(/invalid.*XML/i)).toBeFalsy();
    expect(queryByText(/missing.*xmlns/i)).toBeFalsy();
  });

  it('enables the submit button iff a resource is uploaded or the input is valid JSON/XML', () => {
    const { getByLabelText, getByDisplayValue } = renderWithRouter(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);
    const fileInput = getByLabelText(/upload.*resource/i);
    const submitButton = getByDisplayValue(/validate/i);

    expect(submitButton).toBeDisabled();

    fireEvent.change(textField, { target: { value: `{ "resourceType": "Patient" }` } });
    expect(submitButton).toBeEnabled();

    fireEvent.change(textField, { target: { value: '' } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(textField, { target: { value: `<MedicationRequest xmlns="http://hl7.org/fhir"></MedicationRequest>` } });
    expect(submitButton).toBeEnabled();

    fireEvent.change(textField, { target: { value: `{ 'singleQuotes': true }` } });
    expect(submitButton).toBeDisabled();

    fireEvent.change(textField, { target: { value: `<ValidXML></ValidXML>` } });
    expect(submitButton).toBeDisabled();

    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(submitButton).toBeEnabled();

    fireEvent.change(fileInput, { target: { files: [] } });
    expect(submitButton).toBeDisabled();
  });
});
