import React, { useReducer, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { validateWith, addProfile } from '../models/HL7Validator';
import { resourceValidator } from '../models/Resource';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';
import {
  FormInputItem,
  FormInputItemProps,
  State as FormInputItemState,
  Action as FormInputItemAction,
  reducer as formInputItemReducer,
  initialState as initialFormInputItemState,
} from './FormInputItem';
import { withContext } from '../hoc/withContext';
import { AppState } from './App';
import { RESULTS_PATH } from './Results';

type KeysWithValue<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

export interface FormState {
  resource: FormInputItemState;
  profile: FormInputItemState;
  implementation_guide?: string;
  profile_select: SelectOption | null;
  error: string;
};

type FormAction =
  | ({ name: KeysWithValue<FormState, FormInputItemState> } & FormInputItemAction)
  | { name: 'implementation_guide', value: string }
  | { name: 'profile_select', value: SelectOption }
  | { name: 'SET_ERROR', error: string }
  | { name: 'RESET' };

const initialFormState: FormState = {
  resource: initialFormInputItemState,
  profile: initialFormInputItemState,
  profile_select: null,
  error: '',
};

const formReducer = (state: FormState, action: FormAction): FormState => {
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
    case 'SET_ERROR': {
      newState.error = action.error;
      break;
    }
    case 'RESET': {
      newState = initialFormState;
      break;
    }
  }
  return newState;
};

export const FormContext = React.createContext<[FormState, React.Dispatch<FormAction>]>(null!);
const ResourceFormInputItem = withContext(
  FormContext,
  FormInputItem as React.ComponentType<FormInputItemProps<FormState, 'resource'>>
);
const ProfileFormInputItem = withContext(
  FormContext,
  FormInputItem as React.ComponentType<FormInputItemProps<FormState, 'profile'>>
);

interface ValidatorProps {
  readonly basePath?: string;
}

export function ValidatorForm({ basePath = '' }: ValidatorProps) {
  const history = useHistory<AppState>();
  const [formState, dispatch] = useReducer(
    formReducer,
    history.location.state || initialFormState,
  );

  useEffect(() => {
    const deleteHistoryState = () => history.replace(history.location.pathname);
    window.addEventListener('beforeunload', deleteHistoryState);
    return () => window.removeEventListener('beforeunload', deleteHistoryState);
  }, []);

  const {
    resource: {
      text: resourceBlob,
      error: resourceError,
    },
    profile: {
      text: profileBlob,
      error: profileError,
    },
    profile_select: profileSelectState,
    error,
  } = formState;

  const disableSubmit = !resourceBlob || !!resourceError || !!profileError;

  const handleError = (error: string) => {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      dispatch({ name: 'SET_ERROR', error });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (disableSubmit) {
      return handleError('Failed to submit form: Resource is invalid');
    }

    const selectedProfile = profileSelectState?.value;
    const profileUrls = selectedProfile ? [selectedProfile] : [];

    try {
      if (profileBlob.trim()) {
        const profileUrl = await addProfile(profileBlob);
        profileUrls.push(profileUrl);
      }
    } catch (error) {
      return handleError(`Failed to upload profile: ${error?.message}`);
    }

    try {
      const results = await validateWith(profileUrls, resourceBlob);
      history.replace(history.location.pathname, formState);
      history.push(basePath + RESULTS_PATH, { ...formState, results });
    } catch (error) {
      return handleError(`Failed to validate resource: ${error?.message}`);
    }
  };

  return (
    <FormContext.Provider value={[formState, dispatch]}>
      {error &&
        <div className="alert alert-danger fade show">
          {error}
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => dispatch({ name: 'SET_ERROR', error: '' })}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
      }
      <form role="form" onSubmit={handleSubmit}>
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
                  <ProfileForm />
                </div>
                <ProfileFormInputItem
                  name="profile"
                  textLabel="Or if you have your own profile, you can paste it here:"
                  fileLabel="Or upload your profile in a file:"
                  validator={input => input && resourceValidator(input)}
                />
              </div>
            </div>
          </div>
        </div>

        <br />

        <div className="form-group">
          <input type="submit" value="Validate" className="btn btn-primary" disabled={disableSubmit} />
          <input type="button" value="Reset" className="btn btn-primary ml-3" onClick={() => dispatch({ name: 'RESET' })} />
        </div>
      </form>
    </FormContext.Provider>
  );
};
