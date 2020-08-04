import React, { useContext, ReactElement } from 'react';

import { FormContext } from './ValidatorForm';
import { ProfileForm } from './ProfileForm';
import { FormInputItem, Action } from './FormInputItem';
import { resourceValidator } from 'models/Resource';

export function AdvancedOptionsCard(): ReactElement {
  const [formState, dispatch] = useContext(FormContext);

  return (
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

        <div
          id="advanced-body"
          className="collapse"
          aria-labelledby="advanced-header"
          data-parent="#advanced-options"
        >
          <div className="card-body">
            <p>
              By default, the FHIR Validator validates your resources using the profile URLs found
              in the "meta.profile" field of your resource (or the Base FHIR profiles if no profile
              URLs are present). However, you may choose to use existing profiles from other
              Implementation Guides or use your own profile to validate your resources.
            </p>
            <br />
            <div className="form-group">
              <ProfileForm />
            </div>
            <FormInputItem
              name="profile"
              state={formState['profile']}
              dispatch={(action: Action): void => dispatch({ name: 'profile', ...action })}
              textLabel="Or if you have your own profile, you can paste it here:"
              fileLabel="Or upload your profile in a file:"
              validator={(input: string): string => input && resourceValidator(input)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
