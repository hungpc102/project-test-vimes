import { generateOrderNumber } from '../../utils/orderNumberGenerator';

// Mock dependencies
jest.mock('../../repositories/ImportOrderRepository');
jest.mock('../../config/database');

describe('OrderNumberGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateOrderNumber', () => {
    it('should generate order number with correct format', async () => {
      // Mock the dynamic imports
      const mockGetLastOrderNumber = jest.fn().mockResolvedValue(null);
      const MockImportOrderRepository = jest.fn().mockImplementation(() => ({
        getLastOrderNumber: mockGetLastOrderNumber
      }));

      jest.doMock('../../repositories/ImportOrderRepository', () => ({
        ImportOrderRepository: MockImportOrderRepository
      }));
      jest.doMock('../../config/database', () => ({
        pool: {}
      }));

      const orderNumber = await generateOrderNumber('PNK');
      
      expect(orderNumber).toMatch(/^PNK-\d{8}-\d{4}$/);
    });

    it('should generate order number starting with given prefix', async () => {
      const mockGetLastOrderNumber = jest.fn().mockResolvedValue(null);
      const MockImportOrderRepository = jest.fn().mockImplementation(() => ({
        getLastOrderNumber: mockGetLastOrderNumber
      }));

      jest.doMock('../../repositories/ImportOrderRepository', () => ({
        ImportOrderRepository: MockImportOrderRepository
      }));
      jest.doMock('../../config/database', () => ({
        pool: {}
      }));

      const orderNumber = await generateOrderNumber('TEST');
      
      expect(orderNumber).toMatch(/^TEST-\d{8}-\d{4}$/);
    });
  });
}); 