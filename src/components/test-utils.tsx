import React, { FC } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { render, RenderResult } from '@testing-library/react';
import { JSONResource } from 'models/Resource';

type RenderOptions = {
  route?: string;
  history?: MemoryHistory;
};

// Adapted from: https://testing-library.com/docs/example-react-router
export const renderWithRouter = (
  ui: JSX.Element,
  { route = '/', history = createMemoryHistory({ initialEntries: [route] }) }: RenderOptions = {}
): RenderResult & { history: MemoryHistory } => {
  const Wrapper: FC = ({ children }) => <Router history={history}>{children}</Router>;
  return {
    ...render(ui, { wrapper: Wrapper }),
    history,
  };
};

type MockGlobal = NodeJS.Global & { fetch: jest.Mock<MockResponse, [string]> };
type MockResponse = {
  ok: boolean;
  statusText?: string;
  json?: () => Promise<string[] | Record<string, string> | JSONResource<'OperationOutcome'>>;
};

export const mockFetch = (): void => {
  (global as MockGlobal).fetch = jest.fn((path: string) => {
    const response: MockResponse = { ok: true };
    let match: RegExpMatchArray | null;
    if (/\/validate(\?.*)?$/.exec(path)) {
      response.json = (): Promise<JSONResource<'OperationOutcome'>> =>
        Promise.resolve({
          resourceType: 'OperationOutcome',
          issue: [],
        });
    } else if (/\/profiles/.exec(path)) {
      return response;
    } else if ((match = /\/igs\/(?<id>.+)/.exec(path))) {
      switch (match.groups?.id) {
        case 'hl7.fhir.r4.core': {
          response.json = (): Promise<string[]> =>
            Promise.resolve([
              'http://hl7.org/fhir/StructureDefinition/Patient',
              'http://hl7.org/fhir/StructureDefinition/MedicationRequest',
            ]);
          break;
        }
        case 'hl7.fhir.us.core': {
          response.json = (): Promise<string[]> =>
            Promise.resolve([
              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
              'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest',
            ]);
          break;
        }
        default:
          response.json = (): Promise<string[]> => Promise.resolve([]);
          break;
      }
    } else if (path.endsWith('/igs')) {
      response.json = (): Promise<Record<string, string>> =>
        Promise.resolve({
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
