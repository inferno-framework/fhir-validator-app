import React, { useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import { History } from 'history';

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

function formReducerWithHistory(history: History<FormState>) {
  return function formReducer(state: FormState, action: FormAction): FormState {
    const { name } = action;
    switch (name) {
      case 'resource':
      case 'profile': {
        const newState = { ...state };
        newState[name] = formInputItemReducer(state[name], action);
        history.replace(history.location.pathname, newState);
        return newState;
      }
    }
  };
}

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const history = useHistory<FormState>();
  const [{ resource: resourceState, profile: profileState }, dispatch] = useReducer(
    formReducerWithHistory(history),
    history.location.state || {
      resource: initialFormInputItemState,
      profile: initialFormInputItemState,
    }
  );

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const invalidResource = (resourceState.mode === 'text') && (!resourceState.input || !!resourceState.error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invalidResource) {
      history.push('/validate');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
              <p>
                By default, the FHIR Validator validates your resources using
                the profile URLs found in the "meta.profile" field of your
                resource (or the Base FHIR profiles if no profile URLs are
                present). However, you may choose to use existing profiles
                from other Implementation Guides or use your own profile to
                validate your resources.
              </p>
              <br />
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
