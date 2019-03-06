export function capitalize(rawWord) {
  const word = rawWord.replace('_', ' ');
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export function getHostname() {
  let hostname = `${window.location.hostname}:5000`;
  if (hostname === 'vitaes.io:5000') {
    hostname = 'renderer.vitaes.io';
  }
  return hostname;
}

export function copyElement(element) {
  return JSON.parse(JSON.stringify(element));
}

export function removeDisabled(rawCv) {
  const cv = copyElement(rawCv);
  Object.keys(cv).forEach((key) => {
    if (Array.isArray(cv[key])) {
      cv[key] = cv[key].filter(element => !element.disable);
    }
  });
  return cv;
}
