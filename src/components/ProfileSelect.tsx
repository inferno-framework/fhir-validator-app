import React, { useContext, ReactElement } from 'react';
import Select, { ValueType, ActionMeta } from 'react-select';

import { SelectOption } from 'models/SelectOption';
import { FormContext } from './ValidatorForm';

export interface ProfileSelectProps {
  readonly options?: SelectOption[];
}

export function ProfileSelect({ options }: ProfileSelectProps): ReactElement {
  const [formState, dispatch] = useContext(FormContext);
  const ig = formState.implementationGuide?.value;
  const value = formState.profileSelect;
  const handleChange = (value: ValueType<SelectOption>, _action: ActionMeta<SelectOption>): void =>
    dispatch({ name: 'profileSelect', value });

  return (
    <div>
      <label htmlFor="profile-select">Select a profile:</label>
      <Select
        isClearable
        isDisabled={!ig}
        isLoading={!!ig && !options}
        options={options}
        name="profile-select"
        id="profile-select"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
