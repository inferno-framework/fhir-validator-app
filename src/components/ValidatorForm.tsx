import React, { useReducer, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import {
  JSONResource,
  isJsonResource,
  isXmlResource,
  parseResource,
  resourceValidator
} from '../models/Resource';
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
import { AppState } from './App';
import { ResultsState, RESULTS_PATH } from './Results';

type KeysWithValue<T, V> = { [K in keyof T]: T[K] extends V ? K : never }[keyof T];

export interface FormState {
  resource: FormInputItemState;
  profile: FormInputItemState;
  implementation_guide: string;
  profile_select: SelectOption | null;
};

type FormAction =
  | ({ name: KeysWithValue<FormState, FormInputItemState> } & FormInputItemAction)
  | { name: 'implementation_guide', value: string }
  | { name: 'profile_select', value: SelectOption }
  | { name: 'RESET' };

const initialFormState: FormState = {
  resource: initialFormInputItemState,
  profile: initialFormInputItemState,
  implementation_guide: 'fhir',
  profile_select: null,
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
const ProfileFormWithContext = withContext(FormContext, ProfileForm);
export const ProfileSelectWithContext = withContext(FormContext, ProfileSelect);

// This function either resolves with the URL of the profile that was
// successfully uploaded or rejects if the profile failed to be uploaded
const addProfile = async (profileBlob: string): Promise<string> => {
  const profile = parseResource(profileBlob);

  let profileBlobUrl: string;
  if (isJsonResource(profile, 'StructureDefinition')) {
    profileBlobUrl = profile.url;
  } else if (isXmlResource(profile, 'StructureDefinition')) {
    const urlElement = [...profile.documentElement.children].find(elt => elt.nodeName === 'url')!;
    profileBlobUrl = urlElement.getAttribute('value')!;
  } else {
    throw new Error('Profile was not a StructureDefinition');
  }

  const response = await fetch('http://localhost:8080/profile', {
    method: 'POST',
    body: profileBlob,
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  } else {
    return profileBlobUrl;
  }
};

// This function either resolves with the OperationOutcome response and other
// details of the resource validated at the '/validate' endpoint or rejects if
// the resource failed to be validated
const validateWith = async (
  profileUrls: string[],
  resourceBlob: string
): Promise<ResultsState> => {
  const resource = parseResource(resourceBlob);
  const resourceType = isJsonResource(resource) ? resource.resourceType : resource.documentElement.nodeName;
  const contentType = isJsonResource(resource) ? 'json' : 'xml';
  if (profileUrls.length === 0) {
    profileUrls.push(`http://hl7.org/fhir/StructureDefinition/${resourceType}`);
  }
  const params = new URLSearchParams({ profile: profileUrls.join(',') });

  const response = await fetch(`http://localhost:8080/validate?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': `application/fhir+${contentType}` },
    body: resourceBlob,
  });
  return {
    outcome: await response.json() as JSONResource<'OperationOutcome'>,
    profileUrls,
    resourceBlob,
    contentType,
  };
};

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const history = useHistory<AppState>();
  const [formState, dispatch] = useReducer(
    formReducer,
    history.location.state || initialFormState,
  );

  useEffect(() => {
    window.onbeforeunload = () => history.replace(history.location.pathname);
  }, []);

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  const resourceState = formState.resource;
  const invalidResource = (resourceState.mode === 'text') && (!resourceState.input || !!resourceState.error);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (invalidResource) {
      return console.error('Failed to submit form: Resource is invalid');
    }

    const {
      resource: resourceState,
      profile: profileState,
      profile_select: profileSelectState,
    } = formState;

    const selectedProfile = profileSelectState?.value;
    const profileUrls = selectedProfile ? [selectedProfile] : [];

    const resourcePromise = resourceState.mode === 'text' ? resourceState.input : resourceState.file.text();
    const profilePromise = profileState.mode === 'text' ? profileState.input : profileState.file.text();

    try {
      const profileBlob = await profilePromise;
      if (profileBlob.trim()) {
        const profileUrl = await addProfile(profileBlob);
        profileUrls.push(profileUrl);
      }
    } catch (error) {
      console.error(`Failed to upload profile: ${error?.message}`);
    }

    try {
      const results = await validateWith(profileUrls, await resourcePromise);
      history.replace(history.location.pathname, formState);
      history.push(basePath + RESULTS_PATH, { ...formState, results });
    } catch (error) {
      console.error(`Failed to validate resource: ${error?.message}`);
    }
  };

  return (
    <FormContext.Provider value={[formState, dispatch]}>
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
