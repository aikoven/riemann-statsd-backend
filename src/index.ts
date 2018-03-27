import {hostname} from 'os';

import {createSocket} from './transport';
import {Msg, IEvent} from '../proto/Riemann';
import {createQueue} from './queue';

interface Config {
  riemann?: {
    host?: string;
    port?: number;
    transport?: 'tcp' | 'udp';
    tags?: string[];
    ttl?: number;
    eventsHost?: string;
  };
}

export const init: StatsdBackend<Config> = (
  startupTime,
  config,
  events,
  logger,
) => {
  const {riemann = {}} = config;

  const {
    host = '127.0.0.1',
    port = 5555,
    transport = 'udp',
    tags = [],
    ttl,
    eventsHost = hostname(),
  } = riemann;

  if (host == null) {
    logger.log('Missing "riemann.host" in statsd config', 'ERR');
    return false;
  }

  function createEvent(time: number, name: string, metric: number): IEvent {
    return {
      host: eventsHost,
      time,
      state: 'ok',
      service: name,
      metricF: metric,
      tags,
      ttl,
    };
  }

  const socket = createSocket(transport, host, port, logger);

  const queue = createQueue(events => {
    // type cast to any because of the wrong Buffer type in protobufjs
    const message = Msg.encode({events}).finish() as any;
    socket.send(message);
  }, transport === 'udp' ? 15000 : Infinity);

  events.on('flush', (timestamp, metrics) => {
    const {timer_data, gauges, counter_rates} = metrics;

    for (const name of Object.keys(gauges)) {
      if (name.startsWith('statsd.')) {
        continue;
      }

      queue.put(createEvent(timestamp, name, gauges[name]));
    }

    for (const name of Object.keys(timer_data)) {
      if (name.startsWith('statsd.')) {
        continue;
      }

      const data = timer_data[name];

      for (const key of Object.keys(data)) {
        queue.put(createEvent(timestamp, `${name}.${key}`, data[key]));
      }
    }

    for (const name of Object.keys(counter_rates)) {
      if (name.startsWith('statsd.')) {
        continue;
      }

      queue.put(createEvent(timestamp, name, counter_rates[name]));
    }

    queue.flush();
  });

  return true;
};
