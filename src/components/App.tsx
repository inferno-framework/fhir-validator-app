import React, { useState, useEffect, ReactElement } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, RESULTS_PATH } from './Results';
import { getVersion, ValidationResult } from 'models/HL7Validator';
import config from 'utils/config';
import appVersion from 'version';

export type AppState = FormState & { results?: ValidationResult };

export function App(): ReactElement {
  const [validatorVersion, setVersion] = useState('');
  useEffect(() => {
    let aborted = false;
    getVersion().then((version) => !aborted && setVersion(version));
    return (): void => void (aborted = true);
  }, []);

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
      <nav className="navbar fixed-bottom navbar-light bg-light">
        <a className="navbar-link" href="https://github.com/inferno-community/fhir-validator-app">
          Open Source
        </a>
        <a
          className="navbar-link"
          href="https://github.com/inferno-community/fhir-validator-app/issues"
        >
          Issues
        </a>
        <a className="navbar-link" href="#!" data-toggle="modal" data-target="#version-modal">
          Version {appVersion}
        </a>
      </nav>
      <div
        className="modal fade"
        id="version-modal"
        tabIndex={-1}
        role="dialog"
        aria-labelledby="version-modal-label"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="version-modal-label">
                Version Info
              </h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              FHIR Validator App Version: {appVersion}
              <br />
              FHIR Validation Service Version: {validatorVersion}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
