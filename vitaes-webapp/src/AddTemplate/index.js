import React, { Component } from 'react';
import firebase from 'firebase';
import _ from 'lodash';
import { getEmptyTemplate } from './util';
import TemplateField from './TemplateField';
import OwnedTemplate from './OwnedTemplate';

class AddTemplate extends Component {
  constructor() {
    super();
    this.state = { template: getEmptyTemplate() };
  }

  render() {
    const ownedCvs = _.filter(this.props.cv_models, template =>
      (template.owner === firebase.auth().currentUser.uid));
    const ownedCvsNodes = _.values(_.mapValues(ownedCvs, (template, cvKey) =>
      (<OwnedTemplate template={template} key={cvKey} />)));

    return (
      <div className="Base">
        <h1>Create a template:</h1>
        <TemplateField
          placeholder="awesome"
          label="Name"
          value={this.state.name}
          callback={(e) => {
            const { template } = this.state;
            template.name = e.target.value;
            this.setState({ template });
          }}
        />
        <TemplateField
          placeholder="pdflatex"
          label="Command"
          value={this.state.command}
          callback={(e) => {
            const { template } = this.state;
            template.command = e.target.value;
            this.setState({ template });
          }}
        />
        <h2>Params:</h2>
        <div className="Base-button">
          <a
            href="#"
            onClick={() => {
              fetch('http://localhost:5000/template/', {
                method: 'POST',
                headers: {
                  Accept: 'application/json',
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.state.template),
              });
              this.setState({ template: getEmptyTemplate() });
            }}
          >
            Submit
          </a>
        </div>
        <div className="Base-button">
          <a href="#" onClick={() => { }}>Add New Param</a>
        </div>
        <hr style={{ marginTop: '3em' }} />
        {ownedCvsNodes}
      </div>
    );
  }
}

export default AddTemplate;
