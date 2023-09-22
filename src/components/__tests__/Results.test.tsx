import React from 'react';
import { createMemoryHistory } from 'history';
import { renderWithRouter } from '../test-utils';
import { Results, RESULTS_PATH } from '../Results';
import { ValidationResult } from 'models/HL7Validator';
import { JSONResource } from 'models/Resource';

describe('<Results />', () => {
  it('renders without crashing', () => {
    const history = createMemoryHistory();
    const results: ValidationResult = {
      outcome: {
        resourceType: 'OperationOutcome',
        issue: [],
      } as JSONResource<'OperationOutcome'>,
      profileUrls: [],
      resourceBlob: '',
      contentType: 'json',
    };
    history.push(RESULTS_PATH, { results });
    renderWithRouter(<Results />, { route: RESULTS_PATH, history });
  });
});
