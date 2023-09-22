import React, { useContext, ReactElement } from 'react';
import Select, { ValueType } from 'react-select';

import { SelectOption } from 'models/SelectOption';
import { FormContext } from './ValidatorForm';

export interface GuideSelectProps {
  readonly igs?: string[];
}

export function GuideSelect({ igs }: GuideSelectProps): ReactElement {
  const [formState, dispatch] = useContext(FormContext);
  const value = formState.implementationGuide;
  const empty: (SelectOption | null | undefined)[] = [];
  const handleChange = (value: ValueType<SelectOption, false>): void =>
    dispatch({ name: 'implementationGuide', value: empty.concat(value)[0] });
  const options = igs?.map((ig) => new SelectOption(ig, ig));

  return (
    <div>
      <label htmlFor="implementation-guide">
        Pick an Implementation Guide to validate against:
      </label>
      <Select
        isClearable
        isLoading={!options}
        options={options}
        name="implementation-guide"
        id="implementation-guide"
        value={value}
        onChange={handleChange}
        aria-label="implementation guide"
      />
    </div>
  );
}
