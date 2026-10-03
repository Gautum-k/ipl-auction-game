type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

class Logger {
  private formatLog(level: LogLevel, message: string, context?: string, data?: Record<string, unknown>): LogPayload {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(data ? { data } : {}),
    };
  }

  info(message: string, context?: string, data?: Record<string, unknown>): void {
    const payload = this.formatLog('INFO', message, context, data);
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(payload));
    } else {
      console.log(`[${payload.timestamp}] ℹ️  [${context || 'APP'}] ${message}`, data ? data : '');
    }
  }

  warn(message: string, context?: string, data?: Record<string, unknown>): void {
    const payload = this.formatLog('WARN', message, context, data);
    if (process.env.NODE_ENV === 'production') {
      console.warn(JSON.stringify(payload));
    } else {
      console.warn(`[${payload.timestamp}] ⚠️  [${context || 'APP'}] ${message}`, data ? data : '');
    }
  }

  error(message: string, context?: string, data?: Record<string, unknown>): void {
    const payload = this.formatLog('ERROR', message, context, data);
    if (process.env.NODE_ENV === 'production') {
      console.error(JSON.stringify(payload));
    } else {
      console.error(`[${payload.timestamp}] 🚨 [${context || 'APP'}] ${message}`, data ? data : '');
    }
  }
}

export const logger = new Logger();
