/**
 * Custom Error Classes for TypeScript
 */

interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  location?: string;
}

export class APIError extends Error {
    public statusCode: number;
    public code: string;
    public isOperational: boolean;
    public timestamp: string;
    public correlationId?: string;

    constructor(
        message: string,
        statusCode: number = 500,
        code: string = 'INTERNAL_ERROR',
        isOperational: boolean = true
    ) {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    setCorrelationId(correlationId: string): this {
        this.correlationId = correlationId;
        return this;
    }

    toJSON(): object {
        return {
            name: this.name,
            message: this.message,
            code: this.code,
            statusCode: this.statusCode,
            timestamp: this.timestamp,
            correlationId: this.correlationId,
            ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
        };
    }
}

export class ValidationError extends APIError {
    public details?: ValidationErrorDetail[];

    constructor(message: string = 'Validation failed', details?: ValidationErrorDetail[]) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }
}

export class NotFoundError extends APIError {
    constructor(message: string = 'Resource not found') {
        super(message, 404, 'NOT_FOUND');
    }
}

export class BusinessLogicError extends APIError {
    constructor(message: string = 'Business rule violation') {
        super(message, 422, 'BUSINESS_LOGIC_ERROR');
    }
}

export class DatabaseError extends APIError {
    constructor(message: string = 'Database operation failed') {
        super(message, 500, 'DATABASE_ERROR');
    }
}

export class AuthenticationError extends APIError {
    constructor(message: string = 'Authentication required') {
        super(message, 401, 'AUTHENTICATION_ERROR');
    }
}

export class AuthorizationError extends APIError {
    constructor(message: string = 'Insufficient permissions') {
        super(message, 403, 'AUTHORIZATION_ERROR');
    }
}

export const createErrorResponse = (
    message: string,
    code: string = 'INTERNAL_ERROR',
    details?: ValidationErrorDetail[],
    statusCode: number = 500,
    correlationId?: string
): object => {
    return {
        success: false,
        error: {
            message,
            code,
            statusCode,
            timestamp: new Date().toISOString(),
            correlationId,
            ...(details && { details })
        }
    };
}; 