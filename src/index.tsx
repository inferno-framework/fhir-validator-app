import React from "react";
import ReactDOM from "react-dom";

import { ValidatorForm } from './components/ValidatorForm';

import { Resource } from "./components/Resource";

const validatorElement = document.getElementById('validator');
if (validatorElement) {
  const basePath = validatorElement.getAttribute('data-base-path');
  const profiles: Map<string, string[]> = JSON.parse(atob(validatorElement.getAttribute('data-profiles')));
  ReactDOM.render(
    <React.StrictMode>
      <ValidatorForm basePath={basePath} profiles={profiles} />
    </React.StrictMode>,
    validatorElement,
  );
}

const element = document.getElementById("resourceDisplay");
if (element != null) {
  const resourceString = element.getAttribute("data-resource-string");
  const resourceType = element.getAttribute("data-resource-type");
  const errors = element.getAttribute("data-issues-errors");
  const warnings = element.getAttribute("data-issues-warnings");
  const information = element.getAttribute("data-issues-information");
  ReactDOM.render(
    <Resource resourceType={resourceType}
      resource={resourceString}
      errors={errors}
      warnings={warnings}
      information={information} />,
    element
  );
}
