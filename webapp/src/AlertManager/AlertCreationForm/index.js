import React, { Component } from 'react';
import _ from 'lodash';
import {
  Form, InputGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Button, Segment } from 'semantic-ui-react';

import { translate } from 'i18n/locale';
import gravitaesql from 'utils/gravitaesql';

import defaultAlert from './default';

export class AlertCreationForm extends Component {
  constructor(props) {
    super(props);
    this.state = { message: defaultAlert() };
    this.addAlert = this.addAlert.bind(this);
  }

  addAlert() {
    const message = _.cloneDeep(this.state.message);
    if (!message.en) {
      toast.error(translate('no_en_message_error'));
      return;
    }
    gravitaesql(null, `
      mutation Createlert($message: String!, $type: AlertType!) {
        createAlert(message: $message, type: $type)
      }
    `, {
      message: message.en,
      type: message.type.toUpperCase(),
    }).then(_ => {
      this.setState({ message: defaultAlert() });
      this.props.onSave();
    });
  }

  render() {
    const forms = Object.values(_.map(_.pickBy(this.state.message, (value, key) => key !== 'type'), (value, key) => (
      <InputGroup
        key={key}
        value={value}
        style={{ marginBottom: 10 }}
      >
        <InputGroup.Prepend>
          <InputGroup.Text>{key}</InputGroup.Text>
        </InputGroup.Prepend>
        <Form.Control
          type="text"
          aria-describedby="inputGroupPrepend"
          required
          value={value}
          onChange={(event) => {
            const { message } = this.state;
            message[key] = event.target.value;
            this.setState({ message });
          }}
        />
      </InputGroup>
    )));

    return (
      <Segment secondary style={{ marginBottom: 10, paddingBottom: 40 }}>
        <h3>{translate('alert_manager')}</h3>
        {forms}
        {/* The entries must stay not translated */}
        <Form.Group>
          <Form.Label>{translate('alert_type')}</Form.Label>
          <Form.Control
            value={this.state.message.type}
            onChange={(event) => {
              const message = _.cloneDeep(this.state.message);
              message.type = event.target.value;
              this.setState({ message });
            }}
            as="select"
          >
            <option>default</option>
            <option>warning</option>
            <option>info</option>
            <option>error</option>
            <option>success</option>
          </Form.Control>
        </Form.Group>
        <Button size="small" secondary style={{ float: 'right' }} onClick={this.addAlert}>{translate('add_alert')}</Button>
      </Segment>
    );
  }
}

export default AlertCreationForm;
