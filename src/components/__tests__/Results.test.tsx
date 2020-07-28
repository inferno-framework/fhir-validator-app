import React from 'react';
import { renderWithRouter } from '../test-utils';
import { createMemoryHistory } from 'history';
import { Results, RESULTS_PATH } from '../Results';
import { ValidationResult } from '../../models/HL7Validator';

describe('<Results />', () => {
  it('renders without crashing', () => {
    const history = createMemoryHistory();
    const results: ValidationResult = {
      outcome: {
        resourceType: 'OperationOutcome',
        issue: [],
      },
      profileUrls: [],
      resourceBlob: '',
      contentType: 'json',
    };
    history.push(RESULTS_PATH, { results });
    renderWithRouter(<Results />, { route: RESULTS_PATH, history });
  });
});
