import React from 'react';

import { ResourceForm } from './ResourceForm';

import { SelectOption } from '../models/SelectOption';
import { ProfileForm } from './ProfileForm';

export interface ValidatorProps {
  readonly basePath: string;
  readonly profiles: Map<string, string[]>;
};

export function ValidatorForm({ basePath, profiles }: ValidatorProps) {
  const optionsByProfile = new Map<string, SelectOption[]>();
  Object.entries(profiles).forEach(([ig, profiles]) => {
    const opts = profiles.map((profile: string) => new SelectOption(profile, profile));
    optionsByProfile.set(ig, opts);
  });

  return (
    <form action={basePath + "/validate"} method="post" encType="multipart/form-data">
      <div className="jumbotron">
        <div className="form-group">
          <ResourceForm />
          <br />
          <div className="custom-file">
            <label htmlFor="resource" className="custom-file-label">Or upload a resource in a file:</label>
            <input type="file" name="resource" id="resource" className="custom-file-input" />
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
        <input type="submit" className="btn btn-primary" />
      </div>
    </form>
  );
};
