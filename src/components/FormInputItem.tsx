import React from 'react';

export const initialState: State = { mode: 'text', input: '', error: '' };

interface TextState { mode: 'text', input: string, error: string };
interface FileState { mode: 'file', file: File };
export type State = TextState | FileState;

interface ChangeInputAction { type: 'CHANGE_INPUT', input: string, validator?: (input: string) => string };
interface UploadFileAction { type: 'UPLOAD_FILE', file: File };
interface RemoveFileAction { type: 'REMOVE_FILE' };
export type Action = ChangeInputAction | UploadFileAction | RemoveFileAction;

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'CHANGE_INPUT': {
      if (state.mode !== 'text')
        return state;

      const { input, validator } = action;
      return {
        ...state,
        input,
        error: validator ? validator(input) : '',
      };
    }
    case 'UPLOAD_FILE': {
      const { file } = action;
      return { ...state, mode: 'file', file };
    }
    case 'REMOVE_FILE': {
      return (state.mode === 'file') ? initialState : state;
    }
  }
};

export interface FormInputItemProps<S extends Record<N, State>, N extends keyof S> {
  readonly name: N;
  readonly textLabel: string;
  readonly fileLabel: string;
  readonly state: State;
  readonly dispatch: React.Dispatch<{ name: N } & Action>;
  readonly validator?: (input: string) => string;
};

export function FormInputItem<S extends Record<N, State>, N extends keyof S>({
  name,
  textLabel,
  fileLabel,
  state,
  dispatch,
  validator,
}: FormInputItemProps<S, N>) {
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => dispatch({
    name,
    type: 'CHANGE_INPUT',
    input: e.target.value,
    validator,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    if (file) {
      dispatch({ name, type: 'UPLOAD_FILE', file });
    } else {
      dispatch({ name, type: 'REMOVE_FILE' });
    }
  };

  const textFieldName = `${name}_field`;
  const fileInputName = `${name}_file`;

  const textFieldClass = state.mode === 'text' ? (state.error && 'is-invalid') : 'disabled';

  return (
    <div className="form-group">
      <label htmlFor={textFieldName}>{textLabel}</label>
      <textarea
        name={textFieldName}
        id={textFieldName}
        className={`form-control custom-text-area ${textFieldClass}`}
        rows={8}
        value={state.mode === 'text' ? state.input : ''}
        onChange={handleTextChange}
        disabled={state.mode !== 'text'}
      />
      <div className="invalid-feedback">
        {state.mode === 'text' && state.error}
      </div>
      <br />
      <div className="custom-file">
        <label htmlFor={fileInputName} className={`custom-file-label ${state.mode === 'file' ? 'selected' : ''}`}>
          {state.mode === 'file' ? state.file.name : fileLabel}
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
