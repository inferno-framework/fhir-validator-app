import React, { useEffect } from 'react';

export const initialState: State = { mode: 'text', text: '', error: '' };

interface TextState { mode: 'text', text: string, error: string };
interface FileState { mode: 'file', text: string, error: string, file: File, status: 'loading' | 'done' };
export type State = TextState | FileState;

interface ChangeTextAction { type: 'CHANGE_TEXT', text: string, validator?: (input: string) => string };
interface UploadFileAction { type: 'UPLOAD_FILE', file: File };
interface RemoveFileAction { type: 'REMOVE_FILE' };
export type Action = ChangeTextAction | UploadFileAction | RemoveFileAction;

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CHANGE_TEXT': {
      const { text, validator } = action;
      return {
        ...state,
        text,
        error: validator ? validator(text) : '',
        ...state.mode === 'file' && { status: 'done' },
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
      return (state.mode === 'file') ? initialState : state;
  }
};

export interface FormInputItemProps<S extends Record<N, State>, N extends keyof S> {
  readonly name: N;
  readonly textLabel: string;
  readonly fileLabel: string;
  readonly validator?: (input: string) => string;
  readonly context: [S, React.Dispatch<{ name: N } & Action>];
};

export function FormInputItem<S extends Record<N, State>, N extends keyof S>({
  name,
  textLabel,
  fileLabel,
  context: [formState, dispatch],
  validator,
}: FormInputItemProps<S, N>) {
  const changeText = (text: string) => dispatch({ name, type: 'CHANGE_TEXT', text, validator });
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => changeText(e.target.value);

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

  const state = formState[name] as State;
  const textFieldClass = state.mode === 'text' ? (state.error && 'is-invalid') : 'disabled';
  const fileInputClass = state.mode === 'file' ? (state.error && 'is-invalid') : '';

  useEffect(() => {
    if (state.mode === 'file' && state.status === 'loading') {
      state.file.text()
        .then(changeText)
        .catch(error => error?.message ?? 'There was an error reading the uploaded file')
    }
  }, [state]);

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
      <div className="invalid-feedback">
        {state.mode === 'text' && state.error}
      </div>
      <br />
      <div className="custom-file">
        <input
          type="file"
          name={fileInputName}
          id={fileInputName}
          className={`custom-file-input ${fileInputClass}`}
          onChange={handleFileChange}
        />
        <label htmlFor={fileInputName} className={`custom-file-label ${state.mode === 'file' ? 'selected' : ''}`}>
          {state.mode === 'file'
            ? state.status === 'loading' ? 'Loading...' : state.file.name
            : fileLabel
          }
        </label>
        <div className="invalid-feedback">
          {state.mode === 'file' && state.error}
        </div>
      </div>
    </div>
  );
};
