import React, { useState } from 'react';

export function ResourceForm() {
  const [input, setInput] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value);

  return (
    <div className="form-group">
      <label htmlFor="resource_field">Paste your FHIR resource here:</label>
      <textarea
        name="resource_field"
        id="resource_field"
        className="form-control disable-me"
        rows={8}
        value={input}
        onChange={handleChange}
      />
    </div>
  );
};
