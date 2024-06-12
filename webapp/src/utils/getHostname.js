const isLocalhost = Boolean(
  window.location.hostname === 'localhost'
    // [::1] is the IPv6 localhost address.
    || window.location.hostname === '[::1]'
    // 127.0.0.1/8 is considered localhost for IPv4.
    || window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/,
    ),
);

const getHostname = (target, port) => {
  if (isLocalhost) {
    return `localhost:${port}`;
  }

  return `${target}.vitaes.io`;
};


// TODO get data from ENV
export const getApiHostname = () => getHostname('api', 6001);

export const getLoggerHostname = () => getHostname('logger', 6002);

export const getStorageHostname = () => getHostname('storage', 6003);

export const getGravitaesqlHostname = () => getHostname('gravitaesql', 6007);
