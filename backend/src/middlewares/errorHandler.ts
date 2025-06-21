import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../types';

export const errorHandler = (
    error: any,
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    logger.error('Error caught by error handler', {
        error: error.message,
        stack: error.stack,
        correlationId: req.correlationId
    });

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        error: {
            message,
            code: error.code || 'INTERNAL_ERROR',
            statusCode,
            timestamp: new Date().toISOString(),
            correlationId: req.correlationId
        }
    });
}; 