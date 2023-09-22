export type JSONResource<T extends string = string> = {
  resourceType: T;
} & (T extends 'StructureDefinition' ? { url: string } : object) &
  (T extends 'OperationOutcome' ? { issue: Issue[] } : object);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type XMLResource<_T extends string = string> = Document;

export type Element = { id?: string; extension?: Extension[] };

export type Extension = {
  url: string;
  valueInteger?: number;
};

export interface Issue extends Element {
  severity: 'fatal' | 'error' | 'warning' | 'information';
  code: string;
  details?: CodeableConcept;
  diagnostics?: string;
  location?: string[];
  expression?: string[];
}

export type CodeableConcept = { coding?: Coding[]; text?: string };

export type Coding = {
  system?: string;
  version?: string;
  code?: string;
  display?: string;
  userSelected?: boolean;
};

export function isJsonResource(o: unknown): o is JSONResource;
export function isJsonResource<T extends string = string>(
  o: unknown,
  type: T
): o is JSONResource<T>;
export function isJsonResource<T extends string = string>(
  o: unknown,
  type?: T
): o is JSONResource<T> {
  if (o instanceof Object && 'resourceType' in o && typeof o['resourceType'] === 'string') {
    if (!type) {
      return true;
    } else if (o['resourceType'] !== type) {
      return false;
    } else
      switch (type) {
        case 'StructureDefinition':
          return 'url' in o && typeof o['url'] === 'string';
        case 'OperationOutcome':
          return 'issue' in o && (o['issue'] as Issue) instanceof Array;
        default:
          return true;
      }
  } else {
    return false;
  }
}

export function isXmlResource(o: unknown): o is XMLResource;
export function isXmlResource<T extends string = string>(o: unknown, type: T): o is XMLResource<T>;
export function isXmlResource<T extends string = string>(
  o: unknown,
  type?: T
): o is XMLResource<T> {
  if (o instanceof Document && o.documentElement.getAttribute('xmlns') === 'http://hl7.org/fhir') {
    if (!type) {
      return true;
    } else if (o.documentElement.nodeName !== type) {
      return false;
    } else
      switch (type) {
        case 'StructureDefinition': {
          const urlElement = [...o.documentElement.children].find((elt) => elt.nodeName === 'url');
          return !!urlElement && typeof urlElement.getAttribute('value') === 'string';
        }
        case 'OperationOutcome':
          return !![...o.documentElement.children].find((elt) => elt.nodeName === 'issue');
        default:
          return true;
      }
  } else {
    return false;
  }
}

export function parseResource(input: string): JSONResource | XMLResource {
  let parsedJson;
  try {
    parsedJson = JSON.parse(input) as JSON;
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
}

export function resourceValidator(input: string): string {
  try {
    return parseResource(input) && '';
  } catch (error: unknown) {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Unknown Error';
  }
}
