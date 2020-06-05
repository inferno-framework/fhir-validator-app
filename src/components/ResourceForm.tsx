import React, { useState } from 'react';

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

export function ResourceForm() {
  const [input, setInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  let banner;
  try {
    const resource = parseResource(input);
    const resourceType = isResource(resource) ? resource.resourceType : resource.documentElement.nodeName;
    banner = <div className="alert alert-success">Detected resource of type: {resourceType}</div>
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
