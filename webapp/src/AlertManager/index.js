import React, { Component } from 'react';
import {
  Card, ListGroup,
} from 'react-bootstrap';

import { translate } from 'i18n/locale';

import { AlertList } from './AlertList';
import { AlertCreationForm } from './AlertCreationForm';
import { setAlertCallback, setupAlerts } from './util';
import ReactPixel from 'react-facebook-pixel';

export class AlertManager extends Component {
  constructor(props) {
    super(props);
    this.state = { alerts: [] };
    setAlertCallback((value) => { this.setState({ alerts: value }); });
  }

  componentDidMount() {
    ReactPixel.init('898969540474999');
    ReactPixel.pageView(); 
  }

  render() {
    return (
      [
        <AlertCreationForm onSave={ setupAlerts } />,
        <Card>
          <Card.Header>{translate('alerts')}</Card.Header>
          <ListGroup variant="flush">
            <AlertList
              alerts={this.state.alerts}
              setAlerts={deleted => {
                this.setState({
                  alerts: Array.from(this.state.alerts).filter(alert => alert !== deleted)
                });
              }}
            />
          </ListGroup>
        </Card>,
      ]
    );
  }
}

export default AlertManager;
