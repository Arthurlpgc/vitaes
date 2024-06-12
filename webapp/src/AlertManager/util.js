import { toast } from 'react-toastify';

import gravitaesql from 'utils/gravitaesql';

let messages = [];
let messageCallback = () => { };

export function setAlertCallback(callback) {
  messageCallback = callback;
  callback(messages);
}

export function setupAlerts() {
  gravitaesql(null, `
    query AlertList {
      alertList {
        message
        type
      }
    }
  `).then(data => {
    messages = [];
    for (const i in data.alertList) {
      const alert = data.alertList[i];
      messages.push(alert.message);
      toast(alert.message, { type: alert.type.toLowerCase() });
    }
    messageCallback(messages);
  });
}

export default setupAlerts;
