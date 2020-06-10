import React, { useReducer } from 'react';

import { resourceValidator } from '../models/Resource';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';

import { FormInputItem } from './FormInputItem';

export type FormInputItemState =
  | { type: 'input', input: string, error: string }
  | { type: 'file', filename: string };

const defaultFormInputState: FormInputItemState = { type: 'input', input: '', error: '' };

export type FormState = { resource: FormInputItemState, profile: FormInputItemState };
export type FormAction =
  | { type: 'CHANGE_INPUT', field: keyof FormState, input: string, validator?: (input: string) => string }
  | { type: 'UPLOAD_FILE', field: keyof FormState, filename: string }
  | { type: 'REMOVE_FILE', field: keyof FormState };

export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'CHANGE_INPUT': {
      const { field, input, validator } = action;
      const inputItemState = state[field];
      return {
        ...state,
        ...(inputItemState.type === 'input') && {
          [field]: {
            ...inputItemState,
            input,
            error: validator ? validator(input) : '',
          },
        },
      };
    }
    case 'UPLOAD_FILE': {
      const { field, filename } = action;
      return {
        ...state,
        [field]: { type: 'file', filename },
      };
    }
    case 'REMOVE_FILE': {
      const { field } = action;
      return {
        ...state,
        [field]: defaultFormInputState,
      };
    }
  }
};

export const FormContext = React.createContext<React.Dispatch<FormAction>>(null!);

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const [{ resource: resourceState, profile: profileState }, dispatch] = useReducer(formReducer, {
    resource: defaultFormInputState,
    profile: defaultFormInputState,
  });

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const invalidResource = (resourceState.type === 'input') && (!resourceState.input || !!resourceState.error);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (invalidResource) {
      e.preventDefault();
    }
  };

  return (
    <FormContext.Provider value={dispatch}>
      <form action={basePath + '/validate'} method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
        <div className="jumbotron">
          <FormInputItem
            name="resource"
            textLabel="Paste your FHIR resource here:"
            fileLabel="Or upload a resource in a file:"
            state={resourceState}
            validator={resourceValidator}
          />
        </div>

        <div className="jumbotron">
          <div className="form-group">
            <ProfileForm optionsByProfile={optionsByProfile} ig="fhir" />
          </div>
          <FormInputItem
            name="profile"
            textLabel="Or if you have your own profile, you can paste it here:"
            fileLabel="Or upload your profile in a file:"
            state={profileState}
          />
        </div>

        <div className="form-group">
          <input type="submit" value="Validate" className="btn btn-primary" disabled={invalidResource} />
        </div>
      </form>
    </FormContext.Provider>
  );
};
