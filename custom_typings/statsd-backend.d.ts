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
  timer_data: {
    [name: string]: {
      std: number;
      upper: number;
      lower: number;
      count: number;
      count_ps: number;
      sum: number;
      sum_squares: number;
      mean: number;
      median: number;
      // percentile metrics:
      // mean_PCT, upper_PCT, sum_PCT, sum_squares_PCT
      [key: string]: number;
    };
  };
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
