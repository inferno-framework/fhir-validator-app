import React from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter/dist/cjs/light';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import xml from 'react-syntax-highlighter/dist/cjs/languages/hljs/xml';
import docco from 'react-syntax-highlighter/dist/cjs/styles/hljs/docco';

import { Issue } from 'models/Issue';
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('xml', xml);

export interface ResourceProps {
  readonly resource: string;
  readonly contentType: 'json' | 'xml';
  readonly errors: Issue[];
  readonly warnings: Issue[];
  readonly information: Issue[];
}

interface HighlightProps {
  style: { backgroundColor: string };
  id?: string;
}

// 'Resource' describes the shape of props.
// State is never set so we use the '{}' type.
export class Resource extends React.Component<ResourceProps, {}> {
  render(): React.ReactElement {
    const { resource, contentType, errors, warnings, information } = this.props;
    const errorLines = errors.map((e) => e.line);
    const warningLines = warnings.map((w) => w.line);
    const infoLines = information.map((i) => i.line);
    return (
      <SyntaxHighlighter
        language={contentType}
        style={docco}
        showLineNumbers
        wrapLines
        lineProps={(lineNumber: number): HighlightProps =>
          this.highlightProps(lineNumber, errorLines, warningLines, infoLines)
        }
        lineNumberProps={(lineNumber: number): HighlightProps =>
          this.highlightProps(lineNumber, errorLines, warningLines, infoLines)
        }
        data-testid="syntax-highlight"
      >
        {resource}
      </SyntaxHighlighter>
    );
  }

  highlightProps(
    lineNumber: number,
    errorLines: number[],
    warningLines: number[],
    infoLines: number[]
  ): HighlightProps {
    const style = { backgroundColor: '' };
    if (errorLines.includes(lineNumber)) {
      style.backgroundColor = '#f8d7da';
      return { style, id: `error-${lineNumber}` };
    } else if (warningLines.includes(lineNumber)) {
      style.backgroundColor = '#fff3cd';
      return { style, id: `error-${lineNumber}` };
    } else if (infoLines.includes(lineNumber)) {
      style.backgroundColor = '#d1ecf1';
      return { style, id: `error-${lineNumber}` };
    }
    return { style };
  }
}
