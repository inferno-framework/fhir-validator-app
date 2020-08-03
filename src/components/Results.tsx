import React, { ReactElement } from 'react';
import { Redirect, useHistory } from 'react-router-dom';

import { Issue as OIssue } from 'models/Resource';
import { Issue } from 'models/Issue';

import { Issues } from './Issues';
import { Resource } from './Resource';
import { AppState } from './App';

export const RESULTS_PATH = '/results';
const OO_ISSUE_LINE = 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line';

const issueLocation = (issue: OIssue): string =>
  issue.expression?.join(', ') ?? issue.location?.join(', ') ?? '';

const issueLine = (issue: OIssue): number =>
  issue.extension?.find((e) => e.url === OO_ISSUE_LINE)?.valueInteger ?? -1;

const issuesBySeverity = (issues: OIssue[], severity: string): Issue[] =>
  issues
    .filter((i) => i.severity === severity)
    .map((iss) => {
      const issueText = `${issueLocation(iss)}: ${iss.details?.text ?? ''}`;
      return new Issue(issueLine(iss), issueText);
    });

export function Results({ basePath = '' }): ReactElement {
  const history = useHistory<AppState>();
  if (!history.location.state?.results) {
    return <Redirect to={basePath + '/'} />;
  }

  const {
    outcome: { issue },
    profileUrls,
    resourceBlob,
    contentType,
  } = history.location.state.results;

  const fatals = issuesBySeverity(issue, 'fatal');
  const errors = issuesBySeverity(issue, 'error');
  const warnings = issuesBySeverity(issue, 'warning');
  const information = issuesBySeverity(issue, 'information');
  const results = {
    errors: fatals.concat(errors),
    warnings,
    information,
  };

  return (
    <>
      <div className="container">
        Validated the uploaded resource against the{' '}
        {profileUrls.length <= 1 ? (
          <>
            <code>{profileUrls[0]}</code> StructureDefinition
          </>
        ) : (
          <>
            following StructureDefinitions:
            <ul>
              {profileUrls.map((profileUrl, i) => (
                <li key={i}>
                  <code>{profileUrl}</code>
                </li>
              ))}
            </ul>
          </>
        )}
        <br />
        <Issues issues={results.errors} severity="error" />
        <Issues issues={results.warnings} severity="warning" />
        <Issues issues={results.information} severity="information" />
      </div>

      <div className="container">
        <Resource
          contentType={contentType}
          resource={resourceBlob}
          errors={errors}
          warnings={warnings}
          information={information}
        />
      </div>
    </>
  );
}
