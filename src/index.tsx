import React from "react";
import ReactDOM from "react-dom";

import { Resource } from "./components/Resource";
import { ProfileSelect } from "./components/ProfileSelect";

import { SelectOption } from './models/SelectOption';
import { ProfileForm } from "./components/ProfileForm";

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

const selectElement = document.getElementById("profile");
if (selectElement) {
  const profiles:Map<string,string[]> = JSON.parse(atob(selectElement.getAttribute("data-profiles")));
  const optionsByProfile = new Map<String, SelectOption[]>();
  Object.entries(profiles).forEach((value) => {
    const ig = value[0];
    const profiles = value[1];
    const opts = profiles.map((profile:string) => {
      return new SelectOption(profile, profile);
    });
    optionsByProfile.set(ig, opts);
  });
  ReactDOM.render(
    <ProfileForm optionsByProfile={optionsByProfile} ig='fhir' />
    ,
    selectElement
  );
}
