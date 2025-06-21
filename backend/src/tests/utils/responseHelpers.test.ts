import { 
  createSuccessResponse, 
  createErrorResponse,
  HTTP_STATUS
} from '../../utils/responseHelpers';

describe('Response Helpers', () => {
  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const response = createSuccessResponse(data);

      expect(response).toMatchObject({
        success: true,
        timestamp: expect.any(String),
        data: data
      });
    });

    it('should create success response with meta', () => {
      const data = { id: 1, name: 'Test' };
      const meta = { message: 'Success message' };
      const response = createSuccessResponse(data, meta);

      expect(response).toMatchObject({
        success: true,
        timestamp: expect.any(String),
        data: data,
        meta: meta
      });
    });
  });

  describe('HTTP_STATUS', () => {
    it('should have correct status codes', () => {
      expect(HTTP_STATUS.OK).toBe(200);
      expect(HTTP_STATUS.CREATED).toBe(201);
      expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
      expect(HTTP_STATUS.NOT_FOUND).toBe(404);
      expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
    });
  });

  describe('createErrorResponse', () => {
    it('should create error response', () => {
      const response = createErrorResponse('Test error');

      expect(response).toMatchObject({
        success: false,
        timestamp: expect.any(String),
        error: {
          message: 'Test error',
          code: 'INTERNAL_ERROR',
          statusCode: 500
        }
      });
    });
  });
}); 