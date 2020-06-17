import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { ValidatorForm } from './ValidatorForm';

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
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/validate">Validate</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/">
            <h1>FHIR Validator</h1>
            <ValidatorForm profiles={profiles} />
          </Route>
          <Route path="/validate">
            Validation Results
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
