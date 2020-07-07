import React from 'react';
import selectEvent from 'react-select-event';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import { ValidatorForm } from '../ValidatorForm';

describe('<ValidatorForm />', () => {
  it('renders without crashing', () => {
    renderWithRouter(<ValidatorForm basePath="" />);
  });

  it('handles optional arguments without crashing', () => {
    renderWithRouter(<ValidatorForm basePath="" />);
    renderWithRouter(<ValidatorForm />);
    renderWithRouter(<ValidatorForm />);
  });

  it('displays the name of the file that was uploaded', async () => {
    const { getByLabelText, queryByLabelText } = renderWithRouter(<ValidatorForm />);

    const fileInput = getByLabelText(/upload.*resource/i);
    const file = new File([], 'foobar.txt', {});
    file.text = async () => '';
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(queryByLabelText(/foobar\.txt/)).toBeTruthy());
  });

  it('disables textarea iff file is uploaded', async () => {
    const { getByLabelText } = renderWithRouter(<ValidatorForm />);

    const textField = getByLabelText(/paste.*resource/i);
    const fileInput = getByLabelText(/upload.*resource/i);

    expect(textField).toBeEnabled();

    const file = new File([], 'foobar.txt', {});
    file.text = async () => '';
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => expect(textField).toBeDisabled());
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

  it('enables the submit button iff the resource pasted/uploaded is valid JSON/XML', async () => {
    const { getByLabelText, getByDisplayValue, getByText } = renderWithRouter(<ValidatorForm />);

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

    const invalidFile = new File([], 'invalid.txt', {});
    invalidFile.text = async () => '';
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    expect(submitButton).toBeDisabled();
    await waitFor(() => expect(submitButton).toBeDisabled());

    const validFile = new File(['{"resourceType":"Patient"}'], 'valid.txt', {});
    validFile.text = async () => '{"resourceType":"Patient"}';
    fireEvent.change(fileInput, { target: { files: [validFile] } });
    expect(submitButton).toBeDisabled();
    await waitFor(() => expect(submitButton).toBeEnabled());

    fireEvent.click(getByText(/remove/i));
    expect(submitButton).toBeDisabled();
  });

  it.skip('clears the profile select field if the implementation guide is changed', async () => {
    const { getByLabelText, getByRole } = renderWithRouter(<ValidatorForm />);

    const igSelect = getByLabelText(/implementation guide/i);
    const profileSelect = getByLabelText(/select.*profile/i);

    fireEvent.change(igSelect, { target: { value: 'fhir' } });
    expect(getByRole('form')).toHaveFormValues({ profile_select: '' });

    await selectEvent.select(profileSelect, /Patient/);
    expect(getByRole('form')).toHaveFormValues({
      profile_select: 'http://hl7.org/fhir/StructureDefinition/Patient',
    });

    fireEvent.change(igSelect, { target: { value: 'us_core' } });
    expect(getByRole('form')).toHaveFormValues({ profile_select: '' });

    await selectEvent.select(profileSelect, /us-core-patient/);
    expect(getByRole('form')).toHaveFormValues({
      profile_select: 'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
    });
  });
});
