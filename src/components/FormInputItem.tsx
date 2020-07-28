import React, { useEffect, useCallback } from 'react';

export const initialState: State = { mode: 'text', text: '', error: '' };

interface TextState {
  mode: 'text';
  text: string;
  error: string;
}
interface FileState {
  mode: 'file';
  text: string;
  error: string;
  file: File;
  status: 'loading' | 'done';
}
export type State = TextState | FileState;

interface ChangeTextAction {
  type: 'CHANGE_TEXT';
  text: string;
  validator?: (input: string) => string;
}
interface UploadFileAction {
  type: 'UPLOAD_FILE';
  file: File;
}
interface RemoveFileAction {
  type: 'REMOVE_FILE';
}
export type Action = ChangeTextAction | UploadFileAction | RemoveFileAction;

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CHANGE_TEXT': {
      const { text, validator } = action;
      return {
        ...state,
        text,
        error: validator ? validator(text) : '',
        ...(state.mode === 'file' && { status: 'done' }),
      };
    }
    case 'UPLOAD_FILE': {
      const { file } = action;
      return {
        mode: 'file',
        file,
        text: '',
        error: '',
        status: 'loading',
      };
    }
    case 'REMOVE_FILE':
      return state.mode === 'file' ? initialState : state;
  }
};

export interface FormInputItemProps<S extends Record<N, State>, N extends keyof S> {
  readonly name: N;
  readonly textLabel: string;
  readonly fileLabel: string;
  readonly validator?: (input: string) => string;
  readonly context: [S, React.Dispatch<{ name: N } & Action>];
}

export function FormInputItem<S extends Record<N, State>, N extends keyof S>({
  name,
  textLabel,
  fileLabel,
  context: [formState, dispatch],
  validator,
}: FormInputItemProps<S, N>): React.ReactElement {
  const changeText = useCallback(
    (text: string): void => dispatch({ name, type: 'CHANGE_TEXT', text, validator }),
    [dispatch, name, validator]
  );
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void =>
    changeText(e.target.value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow file to be re-uploaded
    if (file) {
      dispatch({ name, type: 'UPLOAD_FILE', file });
    }
  };

  const handleRemoveFile = (): void => dispatch({ name, type: 'REMOVE_FILE' });

  const textFieldName = `${name}_field`;
  const fileInputName = `${name}_file`;

  const state = formState[name] as State;
  const textFieldClass = state.mode === 'text' ? state.error && 'is-invalid' : 'disabled';
  const fileInputClass = state.mode === 'file' ? state.error && 'is-invalid' : '';

  useEffect(() => {
    if (state.mode === 'file' && state.status === 'loading') {
      state.file
        .text()
        .then(changeText)
        .catch((error) => error?.message ?? 'There was an error reading the uploaded file');
    }
  }, [state, changeText]);

  return (
    <div className="form-group">
      <label htmlFor={textFieldName}>{textLabel}</label>
      <textarea
        name={textFieldName}
        id={textFieldName}
        className={`form-control custom-text-area ${textFieldClass}`}
        rows={8}
        value={state.mode === 'text' ? state.text : ''}
        onChange={handleTextChange}
        disabled={state.mode !== 'text'}
      />
      <div className="invalid-feedback">{state.mode === 'text' && state.error}</div>
      <br />
      <div className={`input-group ${fileInputClass}`}>
        <div className="custom-file flex-wrap">
          <input
            type="file"
            name={fileInputName}
            id={fileInputName}
            className={`custom-file-input ${fileInputClass}`}
            onChange={handleFileChange}
          />
          <label
            htmlFor={fileInputName}
            className={`custom-file-label ${state.mode === 'file' ? 'selected' : ''}`}
          >
            {state.mode === 'file'
              ? state.status === 'loading'
                ? 'Loading...'
                : state.file.name
              : fileLabel}
          </label>
          <div className="invalid-feedback w-100">{state.mode === 'file' && state.error}</div>
        </div>
        {state.mode === 'file' && state.status === 'done' && (
          <div className="input-group-append">
            <button type="button" className="btn btn-outline-secondary" onClick={handleRemoveFile}>
              Remove
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
