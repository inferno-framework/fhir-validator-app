import React, { useContext, ReactElement } from 'react';

import { FormContext } from './ValidatorForm';
import { FormInputItem, Action } from './FormInputItem';
import { resourceValidator } from 'models/Resource';

export function ResourceCard(): ReactElement {
  const [formState, dispatch] = useContext(FormContext);

  return (
    <div className="card">
      <div className="card-header">Resource</div>

      <div className="card-body">
        <FormInputItem
          name="resource"
          state={formState['resource']}
          dispatch={(action: Action): void => dispatch({ name: 'resource', ...action })}
          textLabel="Paste your HL7® FHIR® resource here:"
          fileLabel="Or upload a resource in a file:"
          validator={resourceValidator}
        />
      </div>
    </div>
  );
}
