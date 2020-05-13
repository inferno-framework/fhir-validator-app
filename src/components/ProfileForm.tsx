import React from 'react';

import { ProfileSelect } from './ProfileSelect';
import { SelectOption } from '../models/SelectOption';

export interface ProfileProps {
  readonly optionsByProfile: Map<String, SelectOption[]>;
  readonly ig: string;
}

export interface ProfileState {
  readonly ig: string;
}

export class ProfileForm extends React.Component<ProfileProps, ProfileState> {
  constructor(props:ProfileProps) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.state = { ig: this.props.ig };
  }

  handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    this.setState({ig: e.currentTarget.value });
  }

  render() {
    const opts = this.props.optionsByProfile.get(this.state.ig);
    return(
      <div className="form-group">
        <label htmlFor="implementation_guide">Pick an Implementation Guide to validate against:&nbsp;</label>
        <select name="implementation_guide" id="implementation_guide" onChange={this.handleChange} value={this.state.ig}>
          <option value="fhir">Base FHIR 4.0.1</option>
          <option value="us_core">US Core v3.1.0</option>
          <option value="saner">SANER-IG</option>
        </select>
        <ProfileSelect options={opts} />
      </div>
    );
  }
}
