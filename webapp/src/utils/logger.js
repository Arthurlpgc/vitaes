import fetch from 'fetch-retry';

import { getLoggerHostname } from 'utils/getHostname';

export default function logger(email, path, step, data, stacktrace) {
  const formData = new URLSearchParams();
  formData.append('email', email);
  if (path) {
    formData.append('cv_hash', path);
  }
  formData.append('origin', 'WEBAPP');
  formData.append('step', step);
  if (data) {
    formData.append('data', data);
  }
  if (stacktrace) {
    formData.append('stacktrace', stacktrace);
  }
  fetch(`${window.location.protocol}//${getLoggerHostname()}/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    },
    body: formData.toString(),
  });
}
