import React from 'react';
import { useHistory } from 'react-router-dom';

import { JSONResource } from '../models/Resource';

interface ResultsState {
  outcome: JSONResource<'OperationOutcome'>;
  profileUrls: string[];
}

export function Results() {
  const history = useHistory<ResultsState>();
  const { outcome, profileUrls } = history.location.state;

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
                {profileUrls.map(profileUrl => (
                  <li><code>{profileUrl}</code></li>
                ))}
              </ul>
            </>
          )
        }
        <br/>
        {/* <%= erb(:issues, {}, {issues: @results[:errors], severity: 'error'}) %> */}
        {/* <%= erb(:issues, {}, {issues: @results[:warnings], severity: 'warning'}) %> */}
        {/* <%= erb(:issues, {}, {issues: @results[:information], severity: 'information'}) %> */}
      </div>

      <div className="container">
        {/* <div id="resourceDisplay" */}
        {/*   data-resource-type="<%= @resource_type %>" */}
        {/*   data-resource-string="<%= @resource_string %>" */}
        {/*   data-issues-errors="<%= Base64.encode64(@results[:errors].to_json) %>" */}
        {/*   data-issues-warnings="<%= Base64.encode64(@results[:warnings].to_json) %>" */}
        {/*   data-issues-information="<%= Base64.encode64(@results[:information].to_json) %>" */}
        {/* > */}
        {/* </div> */}
      </div>
    </>
  );
};
