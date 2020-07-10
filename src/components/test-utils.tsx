import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { render } from '@testing-library/react';
import { JSONResource } from '../models/Resource';

type RenderOptions = {
  route?: string;
  history?: ReturnType<typeof createMemoryHistory>;
};

// Adapted from: https://testing-library.com/docs/example-react-router
export const renderWithRouter = (
  ui: JSX.Element,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
  }: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <Router history={history}>{children}</Router>
  );
  return {
    ...render(ui, { wrapper: Wrapper }),
    history,
  };
}

export const mockFetch = () => {
  (global as any).fetch = jest.fn(async (path: string) => {
    const response: any = { ok: true };
    let match: RegExpMatchArray;
    if (path.match(/\/validate(\?.*)?$/)) {
      response.json = async (): Promise<JSONResource<'OperationOutcome'>> => ({
        resourceType: 'OperationOutcome',
        issue: [],
      });
    } else if (path.match(/\/profiles/)) {
    } else if (match = path.match(/\/igs\/(?<id>.+)/)) {
      switch (match.groups.id) {
        case 'hl7.fhir.r4.core': {
          response.json = async () => [
            'http://hl7.org/fhir/StructureDefinition/Patient',
            'http://hl7.org/fhir/StructureDefinition/MedicationRequest',
          ];
          break;
        }
        case 'hl7.fhir.us.core': {
          response.json = async () => [
            'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
            'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest',
          ];
          break;
        }
        default:
          response.json = async (): Promise<string[]> => [];
        break;
      }
    } else if (/\/igs$/.test(path)) {
      response.json = async () => ({
        'hl7.fhir.r4.core': 'http://packages2.fhir.org/packages/hl7.fhir.r4.core/4.0.1',
        'hl7.fhir.us.core': 'http://packages2.fhir.org/packages/hl7.fhir.us.core/3.1.0',
      });
    } else {
      response.ok = false;
      response.statusText = '404 Not Found';
    }
    return response;
  });
};
