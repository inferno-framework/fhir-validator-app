import React, { useState, useEffect, ReactElement } from 'react';
import { Switch, Route } from 'react-router-dom';
import ReactGA from 'react-ga4';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, RESULTS_PATH } from './Results';
import { getVersion, ValidationResult } from 'models/HL7Validator';
import config from 'utils/config';
import appVersion from 'version';
import { TRACKING_ID } from 'utils/ga';

export type AppState = FormState & { results?: ValidationResult };

export function App(): ReactElement {
  const [wrapperVersion, setWrapperVersion] = useState('');
  const [hl7ValidatorVersion, setHl7ValidatorVersion] = useState('');

  if (window.location.hostname === 'inferno.healthit.gov') {
    ReactGA.initialize(TRACKING_ID);
    ReactGA.send({ hitType: 'pageview', page: window.location.href, title: 'Inferno Validator' });
  }

  useEffect(() => {
    let aborted = false;
    void getVersion().then((version) => {
      if (!aborted) {
        setWrapperVersion(version['inferno-framework/fhir-validator-wrapper']);
        setHl7ValidatorVersion(version['org.hl7.fhir.validation']);
      }
    });
    return (): void => void (aborted = true);
  }, []);

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <a className="navbar-brand" href={config('validatorBasePath') ?? '/'}>
          Inferno Resource Validator
        </a>
      </nav>
      <div className="container py-5">
        <Switch>
          <Route exact path="/">
            <h1>Inferno Resource Validator</h1>
            <ValidatorForm />
          </Route>
          <Route path={RESULTS_PATH}>
            <Results />
          </Route>
        </Switch>
      </div>
      <nav className="navbar fixed-bottom navbar-light bg-light" style={{ zIndex: 'auto' }}>
        <a
          className="navbar-link"
          href="https://github.com/inferno-framework/fhir-validator-app"
          target="_blank"
          rel="noreferrer"
        >
          Open Source
        </a>
        <a
          className="navbar-link"
          href="https://github.com/inferno-framework/fhir-validator-app/issues"
          target="_blank"
          rel="noreferrer"
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
              Inferno Resource Validator App Version: {appVersion}
              <br />
              FHIR Validation Wrapper Version: {wrapperVersion}
              <br />
              HL7® Validator Version: {hl7ValidatorVersion}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
