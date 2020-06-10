export type Resource = { resourceType: string };

export function isResource(o: any): o is Resource {
  return o instanceof Object && o.hasOwnProperty('resourceType');
};

export function parseResource(input: string): Resource | XMLDocument {
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
};

export function resourceValidator(input: string): string {
  try {
    return parseResource(input) && '';
  } catch (error) {
    return error.message;
  }
};
