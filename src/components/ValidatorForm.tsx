import React, { useReducer } from 'react';

import { resourceValidator } from '../models/Resource';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';

import { FormInputItem } from './FormInputItem';

export type FormInputItemState =
  | { type: 'input', input: string, status?: { valid: boolean, message: string } }
  | { type: 'file', filename: string };

const defaultFormInputState: FormInputItemState = { type: 'input', input: '' };

export type FormState = { resource: FormInputItemState, profile: FormInputItemState };
export type FormAction =
  | { type: 'CHANGE_INPUT', field: keyof FormState, input: string, validator?: (input: string) => { valid: boolean, message: string } }
  | { type: 'UPLOAD_FILE', field: keyof FormState, filename: string }
  | { type: 'REMOVE_FILE', field: keyof FormState };

function formReducer(state: FormState, action: FormAction): FormState {
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
            ...validator && { status: validator(input) },
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
}

export const FormContext = React.createContext<React.Dispatch<FormAction>>(null!);

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const [formState, dispatch] = useReducer(formReducer, {
    resource: defaultFormInputState,
    profile: defaultFormInputState,
  });

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const invalidResource = (formState.resource.type === 'input') && !formState.resource.status?.valid;
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
            state={formState.resource}
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
            state={formState.profile}
          />
        </div>

        <div className="form-group">
          <input type="submit" className="btn btn-primary" disabled={invalidResource} />
        </div>
      </form>
    </FormContext.Provider>
  );
};