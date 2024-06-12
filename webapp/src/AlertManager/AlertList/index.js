import React from 'react';
import _ from 'lodash';
import { ListGroup, Button } from 'react-bootstrap';

import { translate } from 'i18n/locale';
import gravitaesql from 'utils/gravitaesql';

export function AlertList(props) {
  return Object.values(_.map(props.alerts, alertMsg => (
    <ListGroup.Item>
      {alertMsg}
      <Button
        style={{ float: 'right' }}
        size="sm"
        variant="secondary"
        onClick={() => {
          gravitaesql(null, `
            mutation DeleteAlert($message: String!) {
              deleteAlert(message: $message)
            }
          `, {
            message: alertMsg,
          }).then(_ => props.setAlerts(alertMsg));
        }}
      >
        {translate('delete')}
      </Button>
    </ListGroup.Item>
  )));
}

export default AlertList;
