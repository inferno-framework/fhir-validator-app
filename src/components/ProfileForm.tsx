import React, { useState, useEffect } from 'react';

import { getIgs, loadIg } from '../models/HL7Validator';
import { SelectOption } from '../models/SelectOption';
import { FormState, ProfileSelectWithContext } from './ValidatorForm';

export interface ProfileProps {
  readonly context: [FormState, React.Dispatch<{ name: 'implementation_guide', value: string }>];
}

export function ProfileForm({ context: [formState, dispatch] }: ProfileProps) {
  const [isDisabled, setIsDisabled] = useState(false);
  const [igs, setIgs] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<Record<string, string[]>>({});

  const ig = formState['implementation_guide'] ?? 'hl7.fhir.r4.core';
  const options = profiles[ig]?.map(profile => new SelectOption(profile, profile));

  useEffect(() => {
    let aborted = false;
    getIgs().then(igs => !aborted && setIgs([...Object.keys(igs)].sort()));
    return () => aborted = true;
  }, []);

  useEffect(() => {
    let aborted = false;
    if (!options) {
      setIsDisabled(true);
      loadIg(ig)
        .then(urls => !aborted && setProfiles(profiles => ({ ...profiles, [ig]: urls })))
        .finally(() => !aborted && setIsDisabled(false));
    }
    return () => aborted = true;
  }, [ig, options]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => dispatch({
    name: 'implementation_guide',
    value: e.target.value,
  });

  return (
    <div className="form-group">
      <label htmlFor="implementation_guide">Pick an Implementation Guide to validate against:&nbsp;</label>
      <select name="implementation_guide" id="implementation_guide" onChange={handleChange} value={ig}>
        {igs.map(ig => <option key={ig} value={ig}>{ig}</option>)}
      </select>
      <ProfileSelectWithContext options={options ?? []} isDisabled={isDisabled} />
    </div>
  );
}
