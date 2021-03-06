import {Event, IEvent} from '../proto/Riemann';

export interface Queue {
  put(event: IEvent): void;
  flush(): void;
}

export function createQueue(
  flushEvents: (events: IEvent[]) => void,
  maxBytes: number,
): Queue {
  let events: IEvent[] = [];
  let totalBytes = 0;

  function flush() {
    if (events.length === 0) {
      return;
    }

    const eventsToFlush = events;
    events = [];
    totalBytes = 0;
    flushEvents(eventsToFlush);
  }

  function put(event: IEvent) {
    if (maxBytes !== Infinity) {
      const size = Event.encode(event).len;

      if (totalBytes + size > maxBytes && events.length > 0) {
        flush();
      }

      totalBytes += size;
    }

    events.push(event);
  }

  return {put, flush};
}
