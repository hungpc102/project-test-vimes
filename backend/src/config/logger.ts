/**
 * Logger Configuration Module
 * Professional logging setup with Winston
 * Designed with 20 years of backend experience
 */

import winston, { Logger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

/**
 * Extended Logger interface with custom methods
 */
interface ExtendedLogger extends Logger {
    audit: (message: string, metadata?: object, userId?: string | null, action?: string | null) => void;
    performance: (operation: string, duration: number, metadata?: object) => void;
    security: (message: string, metadata?: object, severity?: string) => void;
    httpMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
}

/**
 * Custom log format with timestamps, level, and metadata
 */
const logFormat = winston.format.combine(
    winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${metaStr}`;
    })
);

/**
 * Console format for development
 */
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({
        format: 'HH:mm:ss'
    }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} ${level}: ${message} ${metaStr}`;
    })
);

/**
 * Create logs directory if it doesn't exist
 */
const logsDir: string = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Winston logger configuration
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'warehouse-api',
        version: process.env.npm_package_version || '1.0.0',
        env: process.env.NODE_ENV || 'development'
    },
    transports: [
        // Error log file
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            zippedArchive: true
        }),
        
        // Combined log file
        new DailyRotateFile({
            filename: path.join(logsDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: process.env.LOG_MAX_FILES || '14d',
            zippedArchive: true
        }),
        
        // Audit log file for important operations
        new DailyRotateFile({
            filename: path.join(logsDir, 'audit-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'info',
            maxSize: process.env.LOG_MAX_SIZE || '20m',
            maxFiles: '30d',
            zippedArchive: true
        })
    ],
    
    // Handle uncaught exceptions and rejections
    exceptionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'exceptions.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ],
    
    rejectionHandlers: [
        new winston.transports.File({ 
            filename: path.join(logsDir, 'rejections.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
}) as ExtendedLogger;

/**
 * Add console transport for development
 */
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
        level: 'debug'
    }));
}

/**
 * Custom audit logging function
 */
logger.audit = (
    message: string, 
    metadata: object = {}, 
    userId: string | null = null, 
    action: string | null = null
): void => {
    logger.info(message, {
        ...metadata,
        audit: true,
        userId,
        action,
        timestamp: new Date().toISOString()
    });
};

/**
 * Custom performance logging function
 */
logger.performance = (operation: string, duration: number, metadata: object = {}): void => {
    logger.info(`Performance: ${operation}`, {
        ...metadata,
        performance: true,
        operation,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString()
    });
};

/**
 * Custom security logging function
 */
logger.security = (message: string, metadata: object = {}, severity: string = 'medium'): void => {
    logger.warn(message, {
        ...metadata,
        security: true,
        severity,
        timestamp: new Date().toISOString()
    });
};

/**
 * HTTP request logging middleware
 */
logger.httpMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const start: number = Date.now();
    
    // Log request
    logger.info('HTTP Request', {
        method: req.method,
        url: req.url,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        correlationId: req.headers['x-correlation-id'] || 'none'
    });
    
    // Log response on finish event
    res.on('finish', () => {
        const duration: number = Date.now() - start;
        
        logger.info('HTTP Response', {
            method: req.method,
            url: req.url,
            statusCode: res.statusCode,
            duration: `${duration}ms`,
            correlationId: req.headers['x-correlation-id'] || 'none'
        });
    });
    
    next();
};

export default logger; 