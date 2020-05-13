import React, { Component } from 'react';
import Select from 'react-select';

export class ProfileSelect extends Component<any, {}> {
  render() {
    return (
      <Select
        isClearable
        options={ this.props.options }
        name="profile"
        id="profile"
      />
    );
  }
}
