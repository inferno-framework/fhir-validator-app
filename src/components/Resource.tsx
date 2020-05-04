import * as React from "react";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco as style } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { Issue } from '../models/Issue';

export interface ResourceProps {
  readonly resource: string;
  readonly resourceType: string;
  readonly errors: string;
  readonly warnings: string;
  readonly information: string;
}

export interface IssueJson {
  readonly line: number;
  readonly text: string;
}

// 'Resource' describes the shape of props.
// State is never set so we use the '{}' type.
export class Resource extends React.Component<ResourceProps, {}> {
  render() {
    const errors = this.parseIssueArray(this.decodeResource(this.props.errors));
    const warnings = this.parseIssueArray(this.decodeResource(this.props.warnings));
    const information = this.parseIssueArray(this.decodeResource(this.props.information));
    const issueLines = errors.map(e => e.line);
    return(
      <SyntaxHighlighter language={this.props.resourceType} 
                         style={style}
                         showLineNumbers={true}
                         wrapLines={true}
                         lineProps={(lineNumber: number) => {
                           return this.highlightProps(lineNumber, issueLines);
                         }}
                         lineNumberProps={(lineNumber: number) => {
                             return this.highlightProps(lineNumber, issueLines);
                         }}
                         data-testid="syntax-highlight">
        { this.decodeResource(this.props.resource) }
      </SyntaxHighlighter>
    );
  }

  highlightProps(lineNumber: number, issueLines: number[]): any {
  let style = { 'backgroundColor': '' };
  let className = null;
  if (issueLines.includes(lineNumber)) {
    style.backgroundColor = "#ff9e9e";
    return { style: style, id: `error-${lineNumber}`}
  }
  return { style: style };
}

  decodeResource(resourceString: string):string {
    return atob(resourceString);
  }

  parseIssueArray(issueString: string):Issue[] {
    const json = JSON.parse(issueString);
    return json.map((obj: IssueJson) => new Issue(obj['line'], obj['text']));
  }
}
