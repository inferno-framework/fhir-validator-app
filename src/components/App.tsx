import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { ValidatorForm, FormState } from './ValidatorForm';
import { Results, ResultsState } from './Results';

const BASE_PATH = '';

export type AppState = FormState & { results?: ResultsState };

export function App() {
  const [profiles, setProfiles] = useState<Record<string, string[]>>({});

  useEffect(() => {
    fetch('data/profiles.json')
      .then(response => response.json())
      .then(setProfiles);
  }, []);

  return (
    <Router>
      <div className="container">
        <nav>
          <ul>
            <li>
              <Link to={BASE_PATH + '/'}>Home</Link>
            </li>
            <li>
              <Link to={BASE_PATH + '/validate'}>Validate</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path={BASE_PATH + '/'}>
            <h1>FHIR Validator</h1>
            <ValidatorForm basePath={BASE_PATH} profiles={profiles} />
          </Route>
          <Route path={BASE_PATH + '/validate'}>
            <Results basePath={BASE_PATH} />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
