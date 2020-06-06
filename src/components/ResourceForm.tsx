import React, { useReducer, useEffect } from 'react';

interface Resource {
  resourceType: string;
}

function isResource(o: any): o is Resource {
  return o instanceof Object && o.hasOwnProperty('resourceType');
}

function parseResource(input: string): Resource | XMLDocument {
  let parsedJson;
  try {
    parsedJson = JSON.parse(input);
  } catch (e) {
    const parser = new DOMParser();
    const parsedXml = parser.parseFromString(input, 'text/xml');
    if (parsedXml.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid JSON/XML');
    } else if (parsedXml.documentElement.getAttribute('xmlns') !== 'http://hl7.org/fhir') {
      throw new Error('XML is missing namespace xmlns="http://hl7.org/fhir"');
    }
    return parsedXml;
  }

  if (isResource(parsedJson)) {
    return parsedJson;
  } else {
    throw new Error('JSON is missing "resourceType" field');
  }
}

type ResourceFormState = {
  dirty: false,
  input: string,
} | {
  dirty: true,
  input: string,
  error?: string,
  resourceType?: string,
};

function reducer(_state: ResourceFormState, action: string): ResourceFormState {
  try {
    const resource = parseResource(action);
    const resourceType = isResource(resource) ? resource.resourceType : resource.documentElement.nodeName;
    return { dirty: true, input: action, resourceType };
  } catch (error) {
    return { dirty: true, input: action, error: error.message };
  }
}

export interface ResourceFormProps {
  setIsValid(valid: boolean): void;
};

export function ResourceForm({ setIsValid }: ResourceFormProps) {
  const [state, dispatch] = useReducer(reducer, { dirty: false, input: '' });
  useEffect(() => setIsValid(state.dirty && !state.error), [state]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => dispatch(e.target.value);

  return (
    <div className="form-group">
      {state.dirty &&
        (state.error
          ? <div className="alert alert-danger">{state.error}</div>
          : <div className="alert alert-success">Detected resource of type: {state.resourceType}</div>
        )
      }
      <label htmlFor="resource_field">Paste your FHIR resource here:</label>
      <textarea
        name="resource_field"
        id="resource_field"
        className="form-control disable-me"
        rows={8}
        value={state.input}
        onChange={handleChange}
      />
    </div>
  );
};
