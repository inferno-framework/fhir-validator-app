import React, { ReactElement } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, RESULTS_PATH } from './Results';
import { ValidationResult } from 'models/HL7Validator';

export type AppState = FormState & { results?: ValidationResult };

export function App(): ReactElement {
  return (
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
  );
}
