import * as udp from 'dgram';
import * as tcp from 'net';

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
    return createTcpSocket(host, port, logger);
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
        `Sending message to udp://${host}:${port} of size ${message.length}`,
      );
      socket.send(message, 0, message.length, port, host, sendCallback);
    },
  };
}

function createTcpSocket(
  host: string,
  port: number,
  logger: StatsdLogger,
): Socket {
  logger.log('Creating TCP socket');

  const socket = new tcp.Socket();
  socket.connect(port, host);
  socket.setKeepAlive(true, 0);
  socket.setNoDelay(true);

  socket.on('error', error => {
    logger.log(`TCP socket error:\n\t${error}`, 'ERR');
  });

  const sendCallback = (error: Error | null) => {
    if (error) {
      logger.log(`Failed to send message:\n\t${error}`, 'ERR');
    }
  };

  return {
    send(message) {
      logger.log(
        `Sending message to tcp://${host}:${port} of size ${message.length}`,
      );
      const length = message.length;
      const b = new Buffer(length + 4);
      b[0] = (length >>> 24) & 0xff;
      b[1] = (length >>> 16) & 0xff;
      b[2] = (length >>> 8) & 0xff;
      b[3] = length & 0xff;
      message.copy(b, 4, 0);
      socket.write(b, sendCallback);
    },
  };
}
