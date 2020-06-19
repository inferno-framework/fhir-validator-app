import React from 'react';
import { useHistory } from 'react-router-dom';

import { JSONResource } from '../models/Resource';
import { Issue } from '../models/Issue';

import { Issues } from './Issues';
import { Resource } from './Resource';

type OperationOutcome = JSONResource<'OperationOutcome'>;
type OIssue = OperationOutcome['issue'][0];

interface ResultsState {
  outcome: OperationOutcome;
  profileUrls: string[];
  resourceBlob: string;
  contentType: 'json' | 'xml';
}

const OO_ISSUE_LINE = 'http://hl7.org/fhir/StructureDefinition/operationoutcome-issue-line';

const issueLocation = (issue: OIssue): string =>
  issue.expression?.join(', ') ?? issue.location.join(', ');

const issueLine = (issue: OIssue): number =>
  issue.extension.find((e: any) => e.url === OO_ISSUE_LINE).valueInteger;

const issuesBySeverity = (issues: OIssue[], severity: string) =>
  issues
    .filter(i => i.severity === severity)
    .map(iss => {
      const issueText = `${issueLocation(iss)}: ${iss?.details?.text ?? ''}`
      return new Issue(issueLine(iss), issueText);
    });

export function Results() {
  const history = useHistory<ResultsState>();
  const {
    outcome: { issue = [] },
    profileUrls,
    resourceBlob,
    contentType,
  } = history.location.state;

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
        Validated the uploaded resource against the {' '}
        {profileUrls.length <= 1
          ? <><code>{profileUrls[0]}</code> StructureDefinition</>
          : (
            <>
              following StructureDefinitions:
              <ul>
                {profileUrls.map((profileUrl, i) => (
                  <li key={i}><code>{profileUrl}</code></li>
                ))}
              </ul>
            </>
          )
        }
        <br/>
        <Issues issues={results.errors} severity={'error'} />
        <Issues issues={results.warnings} severity={'warning'} />
        <Issues issues={results.information} severity={'information'} />
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
};
