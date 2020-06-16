export type JSONResource = { resourceType: string };
export type XMLResource = Document;

export function isJsonResource(o: unknown): o is JSONResource {
  return o instanceof Object && o.hasOwnProperty('resourceType');
};

export function isXmlResource(o: unknown): o is XMLResource {
  return o instanceof Document && o.documentElement.getAttribute('xmlns') === 'http://hl7.org/fhir';
}

export function parseResource(input: string): JSONResource | XMLResource {
  let parsedJson;
  try {
    parsedJson = JSON.parse(input);
  } catch (e) {
    // input was invalid JSON, so try parsing input as XML
    const parser = new DOMParser();
    const parsedXml = parser.parseFromString(input, 'text/xml');

    if (parsedXml.getElementsByTagName('parsererror').length > 0) {
      throw new Error('Invalid JSON/XML');
    } else if (!isXmlResource(parsedXml)) {
      throw new Error('XML is missing namespace xmlns="http://hl7.org/fhir"');
    }
    return parsedXml;
  }

  if (!isJsonResource(parsedJson)) {
    throw new Error('JSON is missing "resourceType" field');
  }
  return parsedJson;
};

export function resourceValidator(input: string): string {
  try {
    return parseResource(input) && '';
  } catch (error) {
    return error.message;
  }
};
