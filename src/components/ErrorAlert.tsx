import React, { ReactElement } from 'react';

interface ErrorAlertProps {
  error: string;
  onClose: () => void;
}

export function ErrorAlert({ error, onClose }: ErrorAlertProps): ReactElement {
  return (
    <div className="alert alert-danger fade show">
      {error}
      <button type="button" className="close" aria-label="Close" onClick={onClose}>
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}
