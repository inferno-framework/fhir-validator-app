import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { ValidatorForm } from '../components/ValidatorForm';

describe('<ValidatorForm />', () => {
  it('renders without crashing', () => {
    render(<ValidatorForm basePath="" profiles={{}} />);
  });

  it('handles optional arguments without crashing', () => {
    render(<ValidatorForm basePath="" />);
    render(<ValidatorForm profiles={{}} />);
    render(<ValidatorForm />);
  });

  it.skip('displays the name of the file that was uploaded', () => {
    const { getByLabelText, queryByLabelText } = render(<ValidatorForm />);

    const fileInput = getByLabelText(/upload.*resource/i);
    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(queryByLabelText(/foobar\.json/)).toBeTruthy();
  });

  it.skip('disables textarea iff file is uploaded', () => {
    const { getByLabelText } = render(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);
    const fileInput = getByLabelText(/upload.*resource/i);

    expect(textField).toBeEnabled();

    const file = new File(['{ "foo": "bar" }'], 'foobar.json', { type: 'text/json' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    expect(textField).toBeDisabled();
  });

  it('can detect valid/invalid JSON and report missing "resourceType"', () => {
    const { getByLabelText, queryByText } = render(<ValidatorForm basePath="" profiles={new Map()} />);

    const textField = getByLabelText(/paste.*resource/i);

    fireEvent.change(textField, { target: { value: `{ "trailingComma": true, }` } });
    expect(queryByText(/invalid.*JSON/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ 'singleQuotes': true }` } });
    expect(queryByText(/invalid.*JSON/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ "validJson": true, "resourceTypePresent": false }` } });
    expect(queryByText(/missing.*resourceType/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `{ "resourceType": "Patient" }` } });
    expect(queryByText(/detected.*Patient/i)).toBeTruthy();
  });

  it('can detect valid/invalid XML and report missing xmlns', () => {
    const { getByLabelText, queryByText } = render(<ValidatorForm basePath="" profiles={new Map()} />);

    const textField = getByLabelText(/paste.*resource/i);

    fireEvent.change(textField, { target: { value: `<NoEndTag>` } });
    expect(queryByText(/invalid.*XML/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<MisplacedAttribute></MisplacedAttribute here="not good">` } });
    expect(queryByText(/invalid.*XML/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<ValidXML></ValidXML>` } });
    expect(queryByText(/missing.*xmlns/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<IncorrectNS xmlns="wrong"></IncorrectNS>` } });
    expect(queryByText(/missing.*xmlns/i)).toBeTruthy();

    fireEvent.change(textField, { target: { value: `<MedicationRequest xmlns="http://hl7.org/fhir"></MedicationRequest>` } });
    expect(queryByText(/detected.*MedicationRequest/i)).toBeTruthy();
  });
});
