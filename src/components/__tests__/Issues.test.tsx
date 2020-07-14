import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Issue } from '../../models/Issue';
import { Issues } from '../Issues';

describe('<Issues />', () => {
  it('renders without crashing', () => {
    render(<Issues issues={[]} severity="error" />);
  });

  it('sorts issues by line number', () => {
    const issues = [
      new Issue(10009, 'hello'),
      new Issue(10001, 'foo'),
      new Issue(10005, 'bar'),
      new Issue(10014, 'world'),
      new Issue(10007, 'baz'),
    ];
    const order = [10001, 10005, 10007, 10009, 10014];

    const { getAllByText } = render(<Issues issues={issues} severity="information" />);
    const issueItems = getAllByText(/line 100\d\d/i);

    expect(issueItems).toHaveLength(5);
    for (let i = 0; i < 5; i++) {
      expect(issueItems[i]).toHaveTextContent(new RegExp(order[i].toString()));
    }
  });

  it('correctly pluralizes severity', () => {
    // No issues tests
    const { queryByText, rerender } = render(<Issues issues={[]} severity="error" />);
    expect(queryByText(/no.*error.*issues/i)).toBeTruthy();

    rerender(<Issues issues={[]} severity="warning" />);
    expect(queryByText(/no.*warning.*issues/i)).toBeTruthy();

    rerender(<Issues issues={[]} severity="information" />);
    expect(queryByText(/no.*information.*issues/i)).toBeTruthy();

    // Single issue tests
    const singleIssue = [new Issue(0, '')];

    rerender(<Issues issues={singleIssue} severity="error" />);
    expect(queryByText(/validation.*error(?!s)/i)).toBeTruthy();

    rerender(<Issues issues={singleIssue} severity="warning" />);
    expect(queryByText(/warning(?!s)/i)).toBeTruthy();

    rerender(<Issues issues={singleIssue} severity="information" />);
    expect(queryByText(/information(?!s)/i)).toBeTruthy();

    // Multiple issues tests
    const multipleIssues = [new Issue(0, ''), new Issue(1, '')];

    rerender(<Issues issues={multipleIssues} severity="error" />);
    expect(queryByText(/validation.*errors/i)).toBeTruthy();

    rerender(<Issues issues={multipleIssues} severity="warning" />);
    expect(queryByText(/warnings/i)).toBeTruthy();

    rerender(<Issues issues={multipleIssues} severity="information" />);
    expect(queryByText(/information(?!s)/i)).toBeTruthy();
  });
});
