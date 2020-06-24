import React from 'react';
import { fireEvent, waitFor, screen } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';
import { createMemoryHistory } from 'history';
import { Results, ResultsState, RESULTS_PATH } from '../Results';

describe('<Results />', () => {
  it('renders without crashing', () => {
    const history = createMemoryHistory();
    const results: ResultsState = {
      outcome: {
        resourceType: 'OperationOutcome',
        url: undefined,
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
