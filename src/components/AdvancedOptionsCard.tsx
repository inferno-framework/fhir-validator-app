import React, { useContext, useState, ReactElement } from 'react';

import { FormContext } from './ValidatorForm';
import { ProfileForm } from './ProfileForm';
import { FormInputItem, Action } from './FormInputItem';
import { resourceValidator } from 'models/Resource';

export function AdvancedOptionsCard(): ReactElement {
  const [formState, dispatch] = useContext(FormContext);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="accordion" id="advanced-options">
      <div className="card" style={{ overflow: expanded ? 'unset' : 'hidden' }}>
        <button
          className="card-header btn btn-link text-left"
          id="advanced-header"
          type="button"
          data-toggle="collapse"
          data-target="#advanced-body"
          aria-expanded="false"
          aria-controls="advanced-body"
          onClick={(): void => setExpanded((expanded) => !expanded)}
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
            <ul className="nav nav-tabs" id="profile-options" role="tablist">
              <li className="nav-item">
                <a
                  className="nav-link active"
                  id="ig-profile-tab"
                  data-toggle="tab"
                  href="#ig-profile"
                  role="tab"
                  aria-controls="ig-profile"
                  aria-selected="true"
                >
                  Load profile from IG
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link"
                  id="standalone-profile-tab"
                  data-toggle="tab"
                  href="#standalone-profile"
                  role="tab"
                  aria-controls="standalone-profile"
                  aria-selected="false"
                >
                  Load standalone profile
                </a>
              </li>
            </ul>
            <br />
            <p>
              By default, the FHIR Validator validates your resources using the profile URLs found
              in the "meta.profile" field of your resource (or the Base FHIR profiles if no profile
              URLs are present). However, you may choose to use existing profiles from other
              Implementation Guides or use your own profile to validate your resources.
            </p>
            <div className="tab-content" id="profile-options-content">
              <div
                className="tab-pane fade show active"
                id="ig-profile"
                role="tabpanel"
                aria-labelledby="ig-profile-tab"
              >
                <ProfileForm />
              </div>
              <div
                className="tab-pane fade"
                id="standalone-profile"
                role="tabpanel"
                aria-labelledby="standalone-profile-tab"
              >
                <FormInputItem
                  name="profile"
                  state={formState['profile']}
                  dispatch={(action: Action): void => dispatch({ name: 'profile', ...action })}
                  textLabel="If you have your own profile, you can paste it here:"
                  fileLabel="Or upload your profile in a file:"
                  validator={(input: string): string => input && resourceValidator(input)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
