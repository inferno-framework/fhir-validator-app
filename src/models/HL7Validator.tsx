import { parseResource, isJsonResource, isXmlResource } from './Resource';

const VALIDATOR_URL = process.env.VALIDATOR_URL ?? 'http://localhost:8080/';

const validatorFetch = async (
  method: string,
  path: string,
  init: RequestInit = {}
) => {
  const response = await fetch(`${VALIDATOR_URL}/${path}`, {
    ...init,
    method,
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
};

const parseJson = async (response: Response) => {
  try {
    return await response.json();
  } catch (e) {
    throw new Error('The response from the server could not be parsed.');
  }
};

// This function either resolves with the OperationOutcome response and other
// details of the resource validated at the '/validate' endpoint or rejects
// if the resource failed to be validated
export const validateWith = async (profileUrls: string[], resourceBlob: string) => {
  const resource = parseResource(resourceBlob);
  const resourceType = isJsonResource(resource) ? resource.resourceType : resource.documentElement.nodeName;
  const contentType = isJsonResource(resource) ? 'json' : 'xml';
  if (profileUrls.length === 0) {
    profileUrls.push(`http://hl7.org/fhir/StructureDefinition/${resourceType}`);
  }

  const profile = profileUrls.join(',');
  const outcome = await validatorFetch('POST', `validate?${new URLSearchParams({ profile })}`, {
    headers: { 'Content-Type': `application/fhir+${contentType}` },
    body: resourceBlob,
  }).then(parseJson);

  if (!isJsonResource(outcome, 'OperationOutcome')) {
    throw new Error('The response from the server was not an OperationOutcome.');
  }

  return {
    outcome,
    profileUrls,
    resourceBlob,
    contentType,
  } as const;
};

// This function either resolves with the URL of the profile that was
// successfully uploaded or rejects if the profile failed to be uploaded
export const addProfile = async (profileBlob: string): Promise<string> => {
  const profile = parseResource(profileBlob);

  let profileBlobUrl: string;
  if (isJsonResource(profile, 'StructureDefinition')) {
    profileBlobUrl = profile.url;
  } else if (isXmlResource(profile, 'StructureDefinition')) {
    const urlElement = [...profile.documentElement.children].find(elt => elt.nodeName === 'url')!;
    profileBlobUrl = urlElement.getAttribute('value')!;
  } else {
    throw new Error('Profile was not a StructureDefinition');
  }

  await validatorFetch('POST', 'profiles', { body: profileBlob });
  return profileBlobUrl;
};

export const getIgs = (): Promise<Record<string, string>> =>
  validatorFetch('GET', 'igs').then(parseJson);

// This function takes a package ID of an IG from packages.fhir.org and loads
// the IG into the external validator
export const loadIg = (id: string): Promise<string[]> =>
  validatorFetch('PUT', `igs/${id}`).then(parseJson);

// This function retrieves a mapping from package ID of an IG to a list of
// canonical URLs of profiles belonging to the IG
export const getProfilesByIg = (): Promise<Record<string, string[]>> =>
  validatorFetch('GET', 'profiles-by-ig').then(parseJson);
