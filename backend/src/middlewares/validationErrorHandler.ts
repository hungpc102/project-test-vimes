import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest, ValidationError as ValidationErrorType } from '../types';

const validationErrorHandler = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): void => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const validationErrors = errors.array().map((error: any) => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value,
            location: error.location
        }));

        res.status(400).json({
            success: false,
            error: {
                message: 'Validation failed',
                code: 'VALIDATION_ERROR',
                statusCode: 400,
                timestamp: new Date().toISOString(),
                correlationId: req.correlationId,
                details: validationErrors
            }
        });
        return;
    }
    
    next();
};

export default validationErrorHandler; 