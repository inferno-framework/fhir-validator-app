import React, { useContext } from 'react';
import Select from 'react-select';

import { SelectOption } from '../models/SelectOption';
import { FormContext } from './ValidatorForm';

export interface GuideSelectProps {
  readonly igs?: string[];
}

export function GuideSelect({ igs }: GuideSelectProps) {
  const [formState, dispatch] = useContext(FormContext);
  const value = formState['implementation_guide'];
  const handleChange = (value: SelectOption) => dispatch({ name: 'implementation_guide', value });
  const options = igs?.map(ig => new SelectOption(ig, ig));

  return (
    <div>
      <label htmlFor="implementation_guide">Pick an Implementation Guide to validate against:</label>
      <Select
        isClearable
        isLoading={!options}
        options={options}
        name="implementation_guide"
        id="implementation_guide"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}
