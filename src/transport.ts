import * as udp from 'dgram';

export interface Socket {
  send(message: Buffer): void;
}

export function createSocket(
  transport: 'tcp' | 'udp',
  host: string,
  port: number,
  logger: StatsdLogger,
): Socket {
  if (transport === 'tcp') {
    throw new Error('TCP transport not implemented yet');
  }

  if (transport === 'udp') {
    return createUdpSocket(host, port, logger);
  }

  throw new Error(`Unknown transport: "${transport}"`);
}

function createUdpSocket(
  host: string,
  port: number,
  logger: StatsdLogger,
): Socket {
  logger.log('Creating UDP socket');

  const socket = udp.createSocket('udp4');

  const sendCallback = (error: Error | null) => {
    if (error) {
      logger.log(`Failed to send message:\n\t${error}`, 'ERR');
    }
  };

  return {
    send(message) {
      logger.log(
        `Sending message to ${host}:${port} of size ${message.length}`,
      );
      socket.send(message, 0, message.length, port, host, sendCallback);
    },
  };
}
