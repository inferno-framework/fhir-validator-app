import * as React from "react";
import * as ReactDOM from "react-dom";

import { Resource } from "./components/Resource";

const element = document.getElementById("resource");
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
