# Riemann StatsD Backend

Sends StatsD stats on each flush to Riemann.

## Installation

    $ npm install riemann-statsd-backend

## Configuration

```js
// config.js
{
  "backends": ["riemann-statsd-backend"],

  "riemann": {
    "host": "127.0.0.1",
    "port": 5555,
    "transport": "udp",  // tcp not supported yet
    "tags": ["some", "tags"],
    "ttl": 60  // ttl seconds, optional
  }
}
```