import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, ResultsState, RESULTS_PATH } from './Results';

const BASE_PATH = process.env.BASE_PATH ?? '';

export type AppState = FormState & { results?: ResultsState };

export function App() {
  return (
    <div className="container">
      <Switch>
        <Route exact path={BASE_PATH + '/'}>
          <h1>FHIR Validator</h1>
          <ValidatorForm basePath={BASE_PATH} />
        </Route>
        <Route path={BASE_PATH + RESULTS_PATH}>
          <Results basePath={BASE_PATH} />
        </Route>
      </Switch>
    </div>
  );
};
