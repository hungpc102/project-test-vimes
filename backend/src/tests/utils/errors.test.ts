import { 
  APIError, 
  ValidationError, 
  DatabaseError, 
  NotFoundError,
  createErrorResponse 
} from '../../utils/errors';

describe('Error Utils', () => {
  describe('APIError', () => {
    it('should create APIError with default values', () => {
      const error = new APIError('Something went wrong');
      
      expect(error.message).toBe('Something went wrong');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.code).toBe('INTERNAL_ERROR');
    });

    it('should create APIError with custom values', () => {
      const error = new APIError('Custom error', 400, 'CUSTOM_CODE');
      
      expect(error.message).toBe('Custom error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with default message', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with default message', () => {
      const error = new DatabaseError();
      
      expect(error.message).toBe('Database operation failed');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('DATABASE_ERROR');
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError with default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response with default values', () => {
      const response = createErrorResponse('Test error');
      
      expect(response).toMatchObject({
        success: false,
        error: {
          message: 'Test error',
          code: 'INTERNAL_ERROR',
          statusCode: 500,
          timestamp: expect.any(String)
        }
      });
    });
  });
}); 