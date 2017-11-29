/// <reference types="node" />

interface StatsdBackend<Config = any> {
  (
    startupTime: number,
    config: Config,
    events: StatsdEventEmitter,
    logger: StatsdLogger,
  ): boolean;
}

interface StatsdMetrics {
  counters: {[name: string]: number};
  timers: {[name: string]: number[]};
  gauges: {[name: string]: number};
  timer_data: {};
  counter_rates: {[name: string]: number};
  sets: {};
  pctThreshold: number[];
}

interface StatsdFlushListener {
  (timestamp: number, metrics: StatsdMetrics): void;
}

interface StatsdEventEmitter extends NodeJS.EventEmitter {
  on(event: 'flush', listener: StatsdFlushListener): this;
}

interface StatsdLogger {
  log(message: string, type?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERR'): void;
}
