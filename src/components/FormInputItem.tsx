import React, { useContext } from 'react';

import { FormInputItemState, FormState, FormContext } from './ValidatorForm';

export interface FormInputItemProps {
  name: keyof FormState;
  textLabel: string;
  fileLabel: string;
  state: FormInputItemState;
  validator?: (input: string) => [boolean, string];
};

export function FormInputItem({
  name,
  textLabel,
  fileLabel,
  state,
  validator,
}: FormInputItemProps) {
  const dispatch = useContext(FormContext);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => dispatch({
    field: name,
    type: 'CHANGE_INPUT',
    input: e.target.value,
    validator,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => dispatch({
    field: name,
    ...e.target.files[0]
      ? { type: 'UPLOAD_FILE', filename: e.target.files[0].name }
      : { type: 'REMOVE_FILE' },
  });

  const textFieldName = `${name}_field`;
  const fileInputName = `${name}_file`;

  const textFieldClass = state.type === 'input' && state.status
    ? (state.status[0] ? 'is-valid' : 'is-invalid')
    : (state.type === 'input' ? '' : 'disabled');

  return (
    <div className="form-group">
      <label htmlFor={textFieldName}>{textLabel}</label>
      <textarea
        name={textFieldName}
        id={textFieldName}
        className={`form-control custom-text-area ${textFieldClass}`}
        rows={8}
        value={state.type === 'input' ? state.input : ''}
        onChange={handleTextChange}
        disabled={state.type !== 'input'}
      />
      {state.type === 'input' && state.status &&
        <div className={`${state.status[0] ? 'valid' : 'invalid'}-feedback`}>
          {state.status[1]}
        </div>
      }
      <br />
      <div className="custom-file">
        <label htmlFor={fileInputName} className={`custom-file-label ${state.type === 'file' ? 'selected' : ''}`}>
          {state.type === 'file' ? state.filename : fileLabel}
        </label>
        <input
          type="file"
          name={fileInputName}
          id={fileInputName}
          className="custom-file-input"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};
