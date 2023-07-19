import { JSONResource, parseResource, isJsonResource, isXmlResource } from './Resource';
import config from 'utils/config';

const VALIDATOR_URL = config('externalValidatorUrl') ?? 'http://localhost:4567';

const validatorFetch = async (
  method: string,
  path: string,
  init: RequestInit = {}
): Promise<Response> => {
  const response = await fetch(`${VALIDATOR_URL}/${path}`, {
    ...init,
    method,
  });
  if (!response?.ok) {
    throw new Error(response?.statusText);
  }
  return response;
};

const parseJson = async (response: Response): ReturnType<Body['json']> => {
  try {
    return (await response.json()) as ReturnType<Body['json']>;
  } catch (e) {
    throw new Error('The response from the server could not be parsed.');
  }
};

export interface ValidationResult {
  outcome: JSONResource<'OperationOutcome'>;
  profileUrls: string[];
  resourceBlob: string;
  contentType: 'json' | 'xml';
}

// This function either resolves with the OperationOutcome response and other
// details of the resource validated at the '/validate' endpoint or rejects
// if the resource failed to be validated
export const validateWith = async (
  profileUrls: string[],
  resourceBlob: string
): Promise<ValidationResult> => {
  const resource = parseResource(resourceBlob);
  const resourceType = isJsonResource(resource)
    ? resource.resourceType
    : resource.documentElement.nodeName;
  const contentType = isJsonResource(resource) ? 'json' : 'xml';
  if (profileUrls.length === 0) {
    profileUrls.push(`http://hl7.org/fhir/StructureDefinition/${resourceType}`);
  }

  const profile = [...new Set(profileUrls)].join(',');
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const searchParams = new URLSearchParams({ profile }).toString();
  const outcome = (await validatorFetch('POST', `validate?${searchParams}`, {
    headers: { 'Content-Type': `application/fhir+${contentType}` },
    body: resourceBlob,
  }).then(parseJson)) as Promise<ValidationResult>;

  if (!isJsonResource(outcome, 'OperationOutcome')) {
    throw new Error('The response from the server was not an OperationOutcome.');
  }

  return {
    outcome,
    profileUrls,
    resourceBlob,
    contentType,
  };
};

// This function either resolves with the URL of the profile that was
// successfully uploaded or rejects if the profile failed to be uploaded
export const addProfile = async (profileBlob: string): Promise<string> => {
  const profile = parseResource(profileBlob);

  let profileBlobUrl: string;
  if (isJsonResource(profile, 'StructureDefinition')) {
    profileBlobUrl = profile.url;
  } else if (isXmlResource(profile, 'StructureDefinition')) {
    const urlElement = [...profile.documentElement.children].find((elt) => elt.nodeName === 'url');
    const url = urlElement?.getAttribute('value');
    if (!url) {
      throw new Error('No profile url found in StructureDefinition');
    }
    profileBlobUrl = url;
  } else {
    throw new Error('Profile was not a StructureDefinition');
  }

  await validatorFetch('POST', 'profiles', { body: profileBlob });
  return profileBlobUrl;
};

export const getIgs = (): Promise<Record<string, string>> =>
  validatorFetch('GET', 'igs').then(parseJson) as Promise<Record<string, string>>;

export type IgResponse = { id: string; version: string; profiles: string[] };

// This function takes a package ID of an IG from packages.fhir.org and loads
// the IG into the external validator
export const loadIg = (id: string): Promise<IgResponse> =>
  validatorFetch('PUT', `igs/${id}`).then(parseJson) as Promise<IgResponse>;

// This function takes an IG package.tgz file and loads the IG into the
// external validator
export const loadPackage = async (file: File): Promise<IgResponse> =>
  validatorFetch('POST', 'igs', {
    body: await file.arrayBuffer(),
    headers: { 'Content-Encoding': 'gzip' },
  }).then(parseJson) as Promise<IgResponse>;

// This function retrieves a mapping from package ID of an IG to a list of
// canonical URLs of profiles belonging to the IG
export const getProfilesByIg = (): Promise<Record<string, string[]>> =>
  validatorFetch('GET', 'profiles-by-ig').then(parseJson) as Promise<Record<string, string[]>>;

export const getVersion = (): Promise<Record<string, string>> =>
  validatorFetch('GET', 'version').then(parseJson);
