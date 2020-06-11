import React, { useReducer } from 'react';

import { resourceValidator } from '../models/Resource';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';
import {
  FormInputItem,
  State as FormInputItemState,
  Action as FormInputItemAction,
  reducer as formInputItemReducer,
  initialState as initialFormInputItemState,
} from './FormInputItem';

type KeysWithValue<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

type FormState = { resource: FormInputItemState, profile: FormInputItemState };
type FormAction = { name: KeysWithValue<FormState, FormInputItemState> } & FormInputItemAction;

function formReducer(state: FormState, action: FormAction): FormState {
  const { name } = action;
  switch (name) {
    case 'resource':
    case 'profile': {
      const newFormInputItemState = formInputItemReducer(state[name], action);
      return {
        ...state,
        [name]: newFormInputItemState,
      };
    }
  }
}

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const [{ resource: resourceState, profile: profileState }, dispatch] = useReducer(formReducer, {
    resource: initialFormInputItemState,
    profile: initialFormInputItemState,
  });

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const invalidResource = (resourceState.mode === 'text') && (!resourceState.input || !!resourceState.error);
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (invalidResource) {
      e.preventDefault();
    }
  };

  return (
    <form action={basePath + '/validate'} method="post" encType="multipart/form-data" onSubmit={handleSubmit}>
      <div className="card">
        <div className="card-header">
          Resource
        </div>

        <div className="card-body">
          <FormInputItem<FormState, 'resource'>
            name="resource"
            textLabel="Paste your FHIR resource here:"
            fileLabel="Or upload a resource in a file:"
            state={resourceState}
            dispatch={dispatch}
            validator={resourceValidator}
          />
        </div>
      </div>

      <br />

      <div className="accordion" id="advanced-options">
        <div className="card">
          <button
            className="card-header btn btn-link text-left"
            id="advanced-header"
            type="button"
            data-toggle="collapse"
            data-target="#advanced-body"
            aria-expanded="false"
            aria-controls="advanced-body"
          >
            Advanced Options
          </button>

          <div id="advanced-body" className="collapse" aria-labelledby="advanced-header" data-parent="#advanced-options">
            <div className="card-body">
              <div className="form-group">
                <ProfileForm optionsByProfile={optionsByProfile} ig="fhir" />
              </div>
              <FormInputItem<FormState, 'profile'>
                name="profile"
                textLabel="Or if you have your own profile, you can paste it here:"
                fileLabel="Or upload your profile in a file:"
                state={profileState}
                dispatch={dispatch}
              />
            </div>
          </div>
        </div>
      </div>

      <br />

      <div className="form-group">
        <input type="submit" value="Validate" className="btn btn-primary" disabled={invalidResource} />
      </div>
    </form>
  );
};
