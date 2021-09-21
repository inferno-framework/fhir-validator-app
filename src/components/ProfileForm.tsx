import React, { useContext, useState, useEffect, ReactElement, ChangeEvent } from 'react';

import { getIgs, loadIg, loadPackage } from 'models/HL7Validator';
import { SelectOption } from 'models/SelectOption';
import { GuideSelect } from './GuideSelect';
import { ProfileSelect } from './ProfileSelect';
import { FormContext } from './ValidatorForm';

type Validity = '' | 'is-valid' | 'is-invalid';

export function ProfileForm(): ReactElement {
  const [formState, dispatch] = useContext(FormContext);
  const [igs, setIgs] = useState<string[]>();
  const [profiles, setProfiles] = useState<Record<string, string[]>>({});
  const [[validity, validInfo], setStatus] = useState<[Validity, string[]]>(['', []]);

  const ig = formState.implementationGuide?.value;
  const options =
    ig === undefined
      ? undefined
      : profiles[ig]?.map((profile) => new SelectOption(profile, profile));

  // 1. GET /igs when component first mounts
  // 2. Default to hl7.fhir.r4.core if implementationGuide was not set on mount
  useEffect(() => {
    let aborted = false;
    if (!igs) {
      getIgs().then((igs) => {
        if (!aborted) {
          const igsKeys = Object.keys(igs);

          igsKeys.forEach((id, index, igsKeys) => {
            const version = igs[id].match(/\d+\.\d+\.\d+/g);
            igsKeys[index] = version ? id + '#' + version : id;
          });

          setIgs(igsKeys.sort());

          if (!ig) {
            const value = new SelectOption('hl7.fhir.r4.core', 'hl7.fhir.r4.core');
            dispatch({ name: 'implementationGuide', value });
          }
        }
      });
    }
    return (): void => void (aborted = true);
  }, [dispatch, igs, ig]);

  // When implementationGuide changes, load IG and cache returned profile URLs (if needed)
  useEffect(() => {
    let aborted = false;
    if (ig && !options) {
      loadIg(ig).then(
        ({ profiles: urls }) => !aborted && setProfiles((profiles) => ({ ...profiles, [ig]: urls }))
      );
    }
    return (): void => void (aborted = true);
  }, [ig, options]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow file to be re-uploaded
    if (file) {
      loadPackage(file)
        .then(({ id, version, profiles: urls }) => {
          setIgs((igs) => igs && (igs.includes(id) ? igs : [...igs, id].sort()));
          // TODO: THIS WILL OVERRIDE EXISTING PROFILES
          setProfiles((profiles) => ({ ...profiles, [id]: urls }));
          setStatus(['is-valid', [id, version]]);
        })
        .catch(() => setStatus(['is-invalid', []]));
    }
  };

  return (
    <div className="form-group">
      <label>
        Don't see your Implementation Guide listed below? Upload your own as a package.tgz!
      </label>
      <div className={`input-group ${validity}`}>
        <div className="custom-file flex-wrap">
          <input
            type="file"
            id="ig-upload"
            className={`custom-file-input ${validity}`}
            onChange={handleChange}
          />
          <label htmlFor="ig-upload" className="custom-file-label">
            Upload a package.tgz
          </label>
          <div className="valid-feedback w-100">
            Successfully uploaded IG "{validInfo[0]}" (version {validInfo[1]})
          </div>
          <div className="invalid-feedback w-100">Failed to upload IG</div>
        </div>
      </div>
      <br />
      <GuideSelect igs={igs} />
      <br />
      <ProfileSelect options={options} />
    </div>
  );
}
