import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
} from 'react-router-dom';
import { ValidatorForm } from './ValidatorForm';

export function App() {
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
            <ValidatorForm />
          </Route>
          <Route path="/validate">
            Validation Results
          </Route>
        </Switch>
      </div>
    </Router>
  );
};
