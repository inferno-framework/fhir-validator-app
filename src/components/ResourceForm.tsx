import React, { useState } from 'react';

interface Resource {
  resourceType: string;
}

function isResource(o: any): o is Resource {
  return o instanceof Object && o.hasOwnProperty('resourceType');
}

function parseResource(input: string): Resource {
  let parsedJson;
  try {
    parsedJson = JSON.parse(input);
  } catch (e) {
    throw new Error('Invalid JSON');
  }

  if (isResource(parsedJson)) {
    return parsedJson;
  } else {
    throw new Error('Missing "resourceType" field');
  }
}

export function ResourceForm() {
  const [input, setInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  let banner;
  try {
    const resource = parseResource(input);
    banner = <div className="alert alert-success">Detected resource of type: {resource.resourceType}</div>
  } catch (error) {
    banner = <div className="alert alert-danger">{error.message}</div>
  }

  return (
    <div className="form-group">
      {banner}
      <label htmlFor="resource_field">Paste your FHIR resource here:</label>
      <textarea
        name="resource_field"
        id="resource_field"
        className="form-control disable-me"
        rows={8}
        value={input}
        onChange={handleChange}
      />
    </div>
  );
};
