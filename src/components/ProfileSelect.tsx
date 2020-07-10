import React, { useContext } from 'react';
import Select from 'react-select';

import { SelectOption } from '../models/SelectOption';
import { FormContext } from './ValidatorForm';

export interface ProfileSelectProps {
  readonly options?: SelectOption[];
}

export function ProfileSelect({ options }: ProfileSelectProps) {
  const [formState, dispatch] = useContext(FormContext);
  const value = formState['profile_select'];
  const handleChange = (value: SelectOption) => dispatch({ name: 'profile_select', value });

  return (
    <div>
      <label htmlFor="profile_select">Select a profile:</label>
      <Select
        isClearable
        isLoading={!options}
        options={options}
        name="profile_select"
        id="profile_select"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
