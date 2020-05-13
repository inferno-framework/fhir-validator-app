import React from "react";
import { render, fireEvent, waitForElement, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Resource, ResourceProps } from '../components/Resource';

function renderResource(props: Partial<ResourceProps> = {}) {
  const defaultProps: ResourceProps = {
    resource: btoa("{ 'foo': 'bar'}"),
    resourceType: 'json',
    errors: btoa("[]"),
    warnings: btoa("[]"),
    information: btoa("[]")
  }
  return render(<Resource {...defaultProps} {...props} />);
};

describe("<Resource />", () => {
  test("Should display a simple JSON object", async () => {
    const { findByTestId } = renderResource();
    const resource = await findByTestId("syntax-highlight");

    expect(resource).toHaveTextContent(/foo/);
    expect(resource).toHaveTextContent(/bar/);
  });
});
