import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';

const notFoundHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    res.status(404).json({
        success: false,
        error: {
            message: `Route ${req.method} ${req.path} not found`,
            code: 'NOT_FOUND',
            statusCode: 404,
            timestamp: new Date().toISOString(),
            correlationId: req.correlationId
        }
    });
};

export default notFoundHandler; 