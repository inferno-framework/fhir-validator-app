import React from 'react';
import { Issue } from '../models/Issue';

interface IssuesProps {
  issues: Issue[],
  severity: 'error' | 'warning' | 'information';
}

export function Issues({
  issues,
  severity,
}: IssuesProps) {
  issues.sort();
  if (issues.length === 0) {
    return <h2>No validation {severity} issues found</h2>;
  } else {
    return (
      <>
        <h2>Validation {severity}{severity !== 'information' && issues.length !== 1 && 's'}:</h2>
        <ul>
          {issues.sort().map((issue, i) => (
            <li key={i}>
              {issue.text} on line {issue.line}. <a href={`#error-${issue.line}`}>Jump to error.</a>
            </li>
          ))}
        </ul>
      </>
    );
  }
};