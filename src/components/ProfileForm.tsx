import React, { useContext, useState, useEffect } from 'react';

import { getIgs, loadIg } from '../models/HL7Validator';
import { SelectOption } from '../models/SelectOption';
import { GuideSelect } from './GuideSelect';
import { ProfileSelect } from './ProfileSelect';
import { FormContext } from './ValidatorForm';

export function ProfileForm() {
  const [formState, dispatch] = useContext(FormContext);
  const [igs, setIgs] = useState<string[]>();
  const [profiles, setProfiles] = useState<Record<string, string[]>>({});

  const ig = formState['implementation_guide']?.value;
  const options = profiles[ig]?.map(profile => new SelectOption(profile, profile));

  useEffect(() => {
    let aborted = false;
    getIgs().then(igs => {
      if (!aborted) {
        setIgs(Object.keys(igs).sort());
        const value = new SelectOption('hl7.fhir.r4.core', 'hl7.fhir.r4.core');
        dispatch({ name: 'implementation_guide', value });
      }
    });
    return () => aborted = true;
  }, []);

  useEffect(() => {
    let aborted = false;
    if (ig && !options) {
      loadIg(ig).then(urls => !aborted && setProfiles(profiles => ({ ...profiles, [ig]: urls })));
    }
    return () => aborted = true;
  }, [ig, options]);

  return (
    <div className="form-group">
      <GuideSelect igs={igs} />
      <ProfileSelect options={options} />
    </div>
  );
}
