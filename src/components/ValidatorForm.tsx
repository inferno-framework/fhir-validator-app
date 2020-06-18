import React, { useReducer } from 'react';
import { useHistory } from 'react-router-dom';
import { History } from 'history';

import { resourceValidator } from '../models/Resource';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';
import { ProfileSelect } from './ProfileSelect';
import {
  FormInputItem,
  FormInputItemProps,
  State as FormInputItemState,
  Action as FormInputItemAction,
  reducer as formInputItemReducer,
  initialState as initialFormInputItemState,
} from './FormInputItem';
import { withContext } from '../hoc/withContext';

type KeysWithValue<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

export interface FormState {
  resource: FormInputItemState;
  profile: FormInputItemState;
  implementation_guide: string;
  profile_select: SelectOption;
};

type FormAction =
  | ({ name: KeysWithValue<FormState, FormInputItemState> } & FormInputItemAction)
  | ({ name: 'implementation_guide', value: string })
  | ({ name: 'profile_select', value: SelectOption })
  | { name: 'RESET' };

const initialFormState: FormState = {
  resource: initialFormInputItemState,
  profile: initialFormInputItemState,
  implementation_guide: 'fhir',
  profile_select: null,
};

const formReducerWithHistory = (history: History<FormState>) => (
  state: FormState,
  action: FormAction,
): FormState => {
  let newState = { ...state };

  switch (action.name) {
    case 'resource':
    case 'profile': {
      newState[action.name] = formInputItemReducer(state[action.name], action);
      break;
    }
    case 'implementation_guide': {
      newState[action.name] = action.value;
      // keep profile_select value in sync with the selected implementation_guide
      newState['profile_select'] = null;
      break;
    }
    case 'profile_select': {
      newState[action.name] = action.value;
      break;
    }
    case 'RESET': {
      newState = initialFormState;
      break;
    }
  }

  history.replace(history.location.pathname, newState);
  return newState;
};

export const FormContext = React.createContext<[FormState, React.Dispatch<FormAction>]>(null!);
const ResourceFormInputItem = withContext(
  FormContext,
  (props: FormInputItemProps<FormState, 'resource'>) => FormInputItem(props),
);
const ProfileFormInputItem = withContext(
  FormContext,
  (props: FormInputItemProps<FormState, 'profile'>) => FormInputItem(props),
);
const ProfileFormWithContext = withContext(FormContext, ProfileForm);
export const ProfileSelectWithContext = withContext(FormContext, ProfileSelect);

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const history = useHistory<FormState>();
  const reducerStateDispatch = useReducer(
    formReducerWithHistory(history),
    history.location.state || initialFormState,
  );
  const [{ resource: resourceState }, dispatch] = reducerStateDispatch;

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const invalidResource = (resourceState.mode === 'text') && (!resourceState.input || !!resourceState.error);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invalidResource) {
      history.push(basePath + '/validate');
    }
  };

  return (
    <FormContext.Provider value={reducerStateDispatch}>
      <form onSubmit={handleSubmit}>
        <div className="card">
          <div className="card-header">
            Resource
          </div>

          <div className="card-body">
            <ResourceFormInputItem
              name="resource"
              textLabel="Paste your FHIR resource here:"
              fileLabel="Or upload a resource in a file:"
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
                  <ProfileFormWithContext optionsByProfile={optionsByProfile} />
                </div>
                <ProfileFormInputItem
                  name="profile"
                  textLabel="Or if you have your own profile, you can paste it here:"
                  fileLabel="Or upload your profile in a file:"
                />
              </div>
            </div>
          </div>
        </div>

        <br />

        <div className="form-group">
          <input type="submit" value="Validate" className="btn btn-primary" disabled={invalidResource} />
          <input type="button" value="Reset" className="btn btn-primary ml-3" onClick={() => dispatch({ name: 'RESET' })} />
        </div>
      </form>
    </FormContext.Provider>
  );
};
