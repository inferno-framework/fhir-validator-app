import React from "react";
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml';
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco';

import { Issue } from '../models/Issue';
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);

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
    const errorLines = errors.map(e => e.line);
    const warningLines = warnings.map(w => w.line);
    const infoLines = information.map(i => i.line);
    return(
      <SyntaxHighlighter language={this.props.resourceType} 
        style={docco}
        showLineNumbers={true}
        wrapLines={true}
        lineProps={(lineNumber: number) => {
          return this.highlightProps(lineNumber, errorLines, warningLines, infoLines);
        }}
        lineNumberProps={(lineNumber: number) => {
          return this.highlightProps(lineNumber, errorLines, warningLines, infoLines);
        }}
        data-testid="syntax-highlight">
        { this.decodeResource(this.props.resource) }
      </SyntaxHighlighter>
    );
  }

  highlightProps(lineNumber: number, errorLines: number[], warningLines: number[], infoLines: number[]): any {
    let style = { 'backgroundColor': '' };
    let className = null;
    if (errorLines.includes(lineNumber)) {
      style.backgroundColor = "#f8d7da";
      return { style: style, id: `error-${lineNumber}`};
    } else if (warningLines.includes(lineNumber)) {
      style.backgroundColor = "#fff3cd";
      return { style: style, id: `error-${lineNumber}` };
    } else if (infoLines.includes(lineNumber)) {
      style.backgroundColor = "#d1ecf1";
      return { style: style, id: `error-${lineNumber}` };
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
