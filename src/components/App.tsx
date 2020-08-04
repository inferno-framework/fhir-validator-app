import React, { ReactElement } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, RESULTS_PATH } from './Results';
import { ValidationResult } from 'models/HL7Validator';
import config from 'utils/config';

export type AppState = FormState & { results?: ValidationResult };

export function App(): ReactElement {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href={config('validatorBasePath') ?? '/'}>
          FHIR Validator
        </a>
      </nav>
      <div className="container">
        <Switch>
          <Route exact path="/">
            <h1>FHIR Validator</h1>
            <ValidatorForm />
          </Route>
          <Route path={RESULTS_PATH}>
            <Results />
          </Route>
        </Switch>
      </div>
    </>
  );
}
