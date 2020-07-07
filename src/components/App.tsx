import React, { useState, useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, ResultsState, RESULTS_PATH } from './Results';

const BASE_PATH = process.env.BASE_PATH ?? '';

export type AppState = FormState & { results?: ResultsState };

export function App() {
  const [profiles, setProfiles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    let aborted = false;
    fetch('data/profiles.json')
      .then(response => response.json())
      .then(profiles => !aborted && setProfiles(profiles));
    return () => aborted = true;
  }, []);

  return (
    <div className="container">
      <Switch>
        <Route exact path={BASE_PATH + '/'}>
          <h1>FHIR Validator</h1>
          <ValidatorForm basePath={BASE_PATH} profiles={profiles} />
        </Route>
        <Route path={BASE_PATH + RESULTS_PATH}>
          <Results basePath={BASE_PATH} />
        </Route>
      </Switch>
    </div>
  );
};
