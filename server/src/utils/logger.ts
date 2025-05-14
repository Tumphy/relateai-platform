import winston from 'winston';
import path from 'path';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Define log directory
const logDir = process.env.LOG_DIR || 'logs';

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'relateai-api' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error' 
    }),
    
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({ 
      filename: path.join(logDir, 'combined.log') 
    })
  ]
});

// If not in production, also log to the console with simpler formatting
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
        const meta = Object.keys(rest).length ? JSON.stringify(rest, null, 2) : '';
        return `${timestamp} [${service}] ${level}: ${message} ${meta}`;
      })
    )
  }));
}

// Create a request logger middleware
export const requestLogger = (req: any, res: any, next: any) => {
  const startTime = new Date().getTime();
  
  // Log request details
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    body: req.method === 'POST' ? filterSensitiveData(req.body) : undefined
  });
  
  // Log response details when finished
  res.on('finish', () => {
    const duration = new Date().getTime() - startTime;
    
    const logLevel = res.statusCode < 400 ? 'info' : 'error';
    
    logger[logLevel](`Response: ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      contentLength: res.get('content-length') || 0
    });
  });
  
  next();
};

// Filter sensitive data from logs
const filterSensitiveData = (data: any) => {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'key', 'credit_card', 
    'ssn', 'email', 'phone', 'address'
  ];
  
  const filtered = { ...data };
  
  // Recursively sanitize object
  const sanitize = (obj: any) => {
    if (!obj || typeof obj !== 'object') return;
    
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      } else if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
        obj[key] = '[REDACTED]';
      }
    });
  };
  
  sanitize(filtered);
  return filtered;
};

export default logger;
