import React, { FC } from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, MemoryHistory } from 'history';
import { render, RenderResult } from '@testing-library/react';
import { JSONResource } from 'models/Resource';
import { IgResponse } from 'models/HL7Validator';

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
  json?: Response['json'];
  text?: Response['text'];
};

export const mockFetch = (): void => {
  (global as unknown as MockGlobal).fetch = jest.fn((path: string) => {
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
    } else if ((match = /\/igs\/(?<id>\S+)(\?version=(?<version>\S*))?$/.exec(path))) {
      switch (match.groups?.id) {
        case 'hl7.fhir.r4.core': {
          response.json = (): Promise<IgResponse> =>
            Promise.resolve({
              id: 'hl7.fhir.r4.core',
              version: '4.0.1',
              profiles: [
                'http://hl7.org/fhir/StructureDefinition/Patient',
                'http://hl7.org/fhir/StructureDefinition/MedicationRequest',
              ],
            });

          break;
        }
        case 'hl7.fhir.us.core': {
          response.json = (): Promise<IgResponse> =>
            Promise.resolve({
              id: 'hl7.fhir.us.core',
              version: '3.1.0',
              profiles: [
                'http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient',
                'http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest',
              ],
            });

          break;
        }
        default: {
          response.ok = false;
          response.statusText = '500 Internal Server Error';
          break;
        }
      }
    } else if (path.endsWith('/igs')) {
      response.json = (): Promise<Record<string, string>> =>
        Promise.resolve({
          'hl7.fhir.r4.core': 'http://packages2.fhir.org/packages/hl7.fhir.r4.core/4.0.1',
          'hl7.fhir.us.core': 'http://packages2.fhir.org/packages/hl7.fhir.us.core/3.1.0',
        });
    } else if (path.endsWith('/version')) {
      response.text = (): Promise<string> => Promise.resolve('5.0.11-SNAPSHOT');
    } else {
      response.ok = false;
      response.statusText = '404 Not Found';
    }
    return response;
  });
};
