import React, { Component } from 'react';
import Select from 'react-select';

export class ProfileSelect extends Component<any, {}> {
  render() {
    return (
      <div>
        <label htmlFor="profile">Select a profile:</label>
        <Select
          isClearable
          options={ this.props.options }
          name="profile"
          id="profile"
        />
      </div>
    );
  }
}
