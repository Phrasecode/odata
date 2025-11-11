import { IAdvancedLoggerOptions, ILoggerOptions } from '../types';

enum LOG_LEVELS {
  INFO = 'INFO',
  ERROR = 'ERROR',
  WARN = 'WARN',
}

enum LOG_FORMATS {
  JSON = 'JSON',
  STRING = 'STRING',
}

enum LOG_LEVEL_VALUES {
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface ILogEntry {
  timestamp: string;
  level: LOG_LEVELS;
  service: string;
  message: string;
  data?: any;
  error?: any;
}

class Logger {
  private logLevel: LOG_LEVELS;
  private format: LOG_FORMATS;
  private enabled: boolean;
  private options: IAdvancedLoggerOptions;
  private static logger: Logger | null = null;

  private constructor(
    enabled?: boolean,
    logLevel?: LOG_LEVELS,
    format?: LOG_FORMATS,
    options?: IAdvancedLoggerOptions,
  ) {
    this.enabled = enabled ?? true;
    this.logLevel = logLevel || LOG_LEVELS.INFO;
    this.format = format || LOG_FORMATS.JSON;
    this.options = options || {};
  }

  public static getLogger(config?: ILoggerOptions): Logger {
    if (!this.logger) {
      const logLevel: LOG_LEVELS =
        config?.logLevel && config.logLevel in LOG_LEVELS
          ? (config.logLevel as LOG_LEVELS)
          : LOG_LEVELS.INFO;
      const format: LOG_FORMATS =
        config?.format && config.format in LOG_FORMATS
          ? (config.format as LOG_FORMATS)
          : LOG_FORMATS.JSON;
      this.logger = new Logger(config?.enabled, logLevel, format, config?.advancedOptions || {});
    }
    return this.logger;
  }

  public static forceSetupLogger(config?: ILoggerOptions) {
    const logLevel: LOG_LEVELS =
      config?.logLevel && config.logLevel in LOG_LEVELS
        ? (config.logLevel as LOG_LEVELS)
        : LOG_LEVELS.INFO;
    const format: LOG_FORMATS =
      config?.format && config.format in LOG_FORMATS
        ? (config.format as LOG_FORMATS)
        : LOG_FORMATS.JSON;
    this.logger = new Logger(config?.enabled, logLevel, format, config?.advancedOptions || {});

    return this.logger;
  }

  public info(message?: string, data?: any, advancedOption?: keyof IAdvancedLoggerOptions) {
    this.log(LOG_LEVELS.INFO, message, data, undefined, advancedOption);
  }
  public error(message?: string, error?: any, data?: any) {
    this.log(LOG_LEVELS.ERROR, message, data, error);
  }
  public warn(message?: string, data?: any) {
    this.log(LOG_LEVELS.WARN, message, data);
  }

  private log(
    logLevel: LOG_LEVELS,
    message?: string,
    data?: any,
    error?: any,
    advancedOption?: keyof IAdvancedLoggerOptions,
  ) {
    if (!this.enabled) {
      return;
    }
    if (advancedOption && this.options[advancedOption]) {
      const logEntry: ILogEntry = {
        timestamp: new Date().toISOString(),
        level: logLevel,
        service: '@phrasecode/odata',
        message: message || '',
        data: data,
      };
      this.print(logEntry);
      return;
    }
    if (LOG_LEVEL_VALUES[logLevel] < LOG_LEVEL_VALUES[this.logLevel]) {
      return;
    }
    const logEntry: ILogEntry = {
      timestamp: new Date().toISOString(),
      level: logLevel,
      service: '@phrasecode/odata',
      message: message || '',
    };
    if (data) logEntry.data = data;
    if (error) logEntry.error = error;

    this.print(logEntry);
  }
  private replacer(key: string, value: any) {
    // Exclude properties that create circular references
    if (key === 'parent' || key === 'include') {
      return undefined;
    }
    return value;
  }

  private formatData(data: any) {
    if (this.format === LOG_FORMATS.STRING) {
      return JSON.stringify(data, (key: string, value: any) => this.replacer(key, value));
    }
    return data;
  }

  private print(logEntry: ILogEntry) {
    console.log(this.formatData(logEntry));
  }
}

export { LOG_FORMATS, LOG_LEVELS, Logger };
