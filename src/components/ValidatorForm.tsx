import React, { useState } from 'react';

import { ResourceForm } from './ResourceForm';
import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';

export type FormInputItemState =
  | { type: 'input', input: string, status?: [boolean, string] }
  | { type: 'file', filename: string };

export type FormState = { resource: FormInputItemState, profile: FormInputItemState };
export type FormAction =
  | { type: 'CHANGE_INPUT', field: keyof FormState, input: string, validator?: (input: string) => [boolean, string] }
  | { type: 'UPLOAD_FILE', field: keyof FormState, filename: string };

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
  }
}

interface ValidatorProps {
  readonly basePath?: string;
  readonly profiles?: Record<string, string[]>;
}

export function ValidatorForm({ basePath = '', profiles = {} }: ValidatorProps) {
  const [isResourceValid, setResourceIsValid] = useState(false);

  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  return (
    <form action={basePath + '/validate'} method="post" encType="multipart/form-data">
      <div className="jumbotron">
        <div className="form-group">
          <ResourceForm setIsValid={setResourceIsValid} />
          <br />
          <div className="custom-file">
            <label htmlFor="resource" className="custom-file-label">Or upload a resource in a file:</label>
            <input type="file" name="resource" id="resource" className="custom-file-input" onChange={() => setResourceIsValid(true)} />
          </div>
        </div>
      </div>

      <div className="jumbotron">
        <div className="form-group">
          <ProfileForm optionsByProfile={optionsByProfile} ig="fhir" />
        </div>
        <div className="form-group">
          <label htmlFor="profile_field">Or if you have your own profile, you can paste it here:</label>
          <textarea name="profile_field" id="profile_field" className="form-control disable-me custom-text-area disable-me-input" rows={8} />
          <br />
          <div className="custom-file">
            <label htmlFor="profile_file" className="custom-file-label disable-me-textarea disable-me-input">Or upload your profile in a file:</label>
            <input type="file" name="profile_file" id="profile_file" className="custom-file-input disable-me-textarea disable-me-input" />
          </div>
        </div>
      </div>

      <div className="form-group">
        <input type="submit" className="btn btn-primary" disabled={!isResourceValid} />
      </div>
    </form>
  );
};
