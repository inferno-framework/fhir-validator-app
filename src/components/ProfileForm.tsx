import React from 'react';

import { ProfileSelect } from './ProfileSelect';
import { SelectOption } from '../models/SelectOption';
import { FormState } from './ValidatorForm';

export interface ProfileProps {
  readonly optionsByProfile: Map<string, SelectOption[]>;
  readonly context: [FormState, React.Dispatch<{ name: 'implementation_guide', value: string }>];
}

export function ProfileForm({
  optionsByProfile,
  context: [formState, dispatch],
}: ProfileProps) {
  const ig = formState['implementation_guide'];
  const opts = optionsByProfile.get(ig);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => dispatch({
    name: 'implementation_guide',
    value: e.target.value,
  });

  return (
    <div className="form-group">
      <label htmlFor="implementation_guide">Pick an Implementation Guide to validate against:&nbsp;</label>
      <select name="implementation_guide" id="implementation_guide" onChange={handleChange} value={ig}>
        <option value="fhir">Base FHIR 4.0.1</option>
        <option value="us_core">US Core v3.1.0</option>
        <option value="saner">SANER-IG</option>
      </select>
      <ProfileSelect options={opts} />
    </div>
  );
}
