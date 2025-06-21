/**
 * Response Helper Functions for TypeScript
 */

import { Response, Request, NextFunction } from 'express';
import { ApiResponse, PaginationMeta, ValidationError } from '../types';
import { AuthenticatedRequest } from '../types';

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Create success response
 */
export const createSuccessResponse = <T>(
    data: T,
    meta?: { message?: string; pagination?: PaginationMeta; [key: string]: any }
): ApiResponse<T> => {
    return {
        success: true,
        timestamp: new Date().toISOString(),
        data,
        ...(meta && { meta })
    };
};

/**
 * Create error response
 */
export const createErrorResponse = (
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: ValidationError[],
    statusCode: number = 500,
    correlationId?: string
): ApiResponse => {
    return {
        success: false,
        timestamp: new Date().toISOString(),
        error: {
            message,
            code,
            statusCode,
            correlationId,
            ...(details && { details })
        }
    };
};

/**
 * Create pagination response
 */
export const createPaginationResponse = <T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): ApiResponse<T[]> => {
    const totalPages = Math.ceil(total / limit);
    
    const pagination: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };

    return createSuccessResponse(data, {
        message,
        pagination
    });
};

/**
 * AsyncHandler - Wraps async route handlers to catch errors
 */
export const AsyncHandler = (
    fn: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Send success response
 */
export const sendSuccess = <T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    message?: string
): void => {
    res.status(statusCode).json(createSuccessResponse(data, { message }));
};

/**
 * Send error response
 */
export const sendError = (
    res: Response,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = 'INTERNAL_ERROR',
    details?: ValidationError[],
    correlationId?: string
): void => {
    res.status(statusCode).json(createErrorResponse(message, code, details, statusCode, correlationId));
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
): void => {
    res.status(HTTP_STATUS.OK).json(createPaginationResponse(data, page, limit, total, message));
}; 