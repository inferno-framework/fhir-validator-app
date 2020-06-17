import React from 'react';
import Select from 'react-select';

import { SelectOption } from '../models/SelectOption';
import { FormState } from './ValidatorForm';

export interface ProfileSelectProps {
  readonly options: SelectOption[];
  readonly context: [FormState, React.Dispatch<{ name: 'profile_select', value: SelectOption }>];
}

export function ProfileSelect({
  options,
  context: [formState, dispatch],
}: ProfileSelectProps) {
  const value = formState['profile_select'];
  const handleChange = (value: SelectOption) => dispatch({ name: 'profile_select', value });

  return (
    <div>
      <label htmlFor="profile_select">Select a profile:</label>
      <Select
        isClearable
        options={options}
        name="profile_select"
        id="profile_select"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
