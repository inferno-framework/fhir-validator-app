export interface JSONResource<T extends string = string> {
  resourceType: T;
  url: string | (T extends 'StructureDefinition' ? never : undefined);
  issue: any[] | (T extends 'OperationOutcome' ? never : undefined);
};
export interface XMLResource<_T extends string = string> extends Document {};

export function isJsonResource(o: unknown): o is JSONResource;
export function isJsonResource<T extends string = string>(o: unknown, type: T): o is JSONResource<T>;
export function isJsonResource<T extends string = string>(o: unknown, type?: T): o is JSONResource<T> {
  if (o instanceof Object && 'resourceType' in o && typeof o['resourceType'] === 'string') {
    if (!type) {
      return true;
    } else if (o['resourceType'] !== type) {
      return false;
    } else switch (type) {
      case 'StructureDefinition':
        return 'url' in o && typeof o['url'] === 'string';
      default:
        return true;
    }
  } else {
    return false;
  }
};

export function isXmlResource(o: unknown): o is XMLResource;
export function isXmlResource<T extends string = string>(o: unknown, type: T): o is XMLResource<T>;
export function isXmlResource<T extends string = string>(o: unknown, type?: T): o is XMLResource<T> {
  if (o instanceof Document && o.documentElement.getAttribute('xmlns') === 'http://hl7.org/fhir') {
    if (!type) {
      return true;
    } else if (o.documentElement.nodeName !== type) {
      return false;
    } else switch (type) {
      case 'StructureDefinition': {
        const urlElement = [...o.documentElement.children].find(elt => elt.nodeName === 'url');
        return !!urlElement && typeof urlElement.getAttribute('value') === 'string';
      }
      default:
        return true;
    }
  } else {
    return false;
  }
};

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
