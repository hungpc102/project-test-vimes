import { ImportOrderHelper, ImportOrderConstants } from '../../models/ImportOrder';
import { ImportOrderItem } from '../../models/ImportOrder';

describe('ImportOrderHelper', () => {
  describe('isValidStatusTransition', () => {
    it('should allow valid transitions from draft', () => {
      expect(ImportOrderHelper.isValidStatusTransition('draft', 'pending')).toBe(true);
      expect(ImportOrderHelper.isValidStatusTransition('draft', 'cancelled')).toBe(true);
    });

    it('should reject invalid transitions from draft', () => {
      expect(ImportOrderHelper.isValidStatusTransition('draft', 'received')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('draft', 'partial')).toBe(false);
    });

    it('should allow valid transitions from pending', () => {
      expect(ImportOrderHelper.isValidStatusTransition('pending', 'partial')).toBe(true);
      expect(ImportOrderHelper.isValidStatusTransition('pending', 'received')).toBe(true);
      expect(ImportOrderHelper.isValidStatusTransition('pending', 'cancelled')).toBe(true);
    });

    it('should reject invalid transitions from pending', () => {
      expect(ImportOrderHelper.isValidStatusTransition('pending', 'draft')).toBe(false);
    });

    it('should allow valid transitions from partial', () => {
      expect(ImportOrderHelper.isValidStatusTransition('partial', 'received')).toBe(true);
      expect(ImportOrderHelper.isValidStatusTransition('partial', 'cancelled')).toBe(true);
    });

    it('should reject invalid transitions from partial', () => {
      expect(ImportOrderHelper.isValidStatusTransition('partial', 'draft')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('partial', 'pending')).toBe(false);
    });

    it('should reject all transitions from received', () => {
      expect(ImportOrderHelper.isValidStatusTransition('received', 'draft')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('received', 'pending')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('received', 'partial')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('received', 'cancelled')).toBe(false);
    });

    it('should reject all transitions from cancelled', () => {
      expect(ImportOrderHelper.isValidStatusTransition('cancelled', 'draft')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('cancelled', 'pending')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('cancelled', 'partial')).toBe(false);
      expect(ImportOrderHelper.isValidStatusTransition('cancelled', 'received')).toBe(false);
    });
  });

  describe('calculateTotalAmount', () => {
    it('should calculate total amount correctly', () => {
      const items: ImportOrderItem[] = [
        {
          product_id: '1',
          quantity_ordered: 10,
          unit_price: 100.50
        },
        {
          product_id: '2',
          quantity_ordered: 5,
          unit_price: 200.00
        }
      ];

      const total = ImportOrderHelper.calculateTotalAmount(items);
      expect(total).toBe(2005.00); // (10 * 100.50) + (5 * 200.00)
    });

    it('should handle empty items array', () => {
      const items: ImportOrderItem[] = [];
      const total = ImportOrderHelper.calculateTotalAmount(items);
      expect(total).toBe(0);
    });

    it('should handle single item', () => {
      const items: ImportOrderItem[] = [
        {
          product_id: '1',
          quantity_ordered: 3,
          unit_price: 50.75
        }
      ];

      const total = ImportOrderHelper.calculateTotalAmount(items);
      expect(total).toBe(152.25); // 3 * 50.75
    });

    it('should handle decimal precision correctly', () => {
      const items: ImportOrderItem[] = [
        {
          product_id: '1',
          quantity_ordered: 7,
          unit_price: 15.99
        }
      ];

      const total = ImportOrderHelper.calculateTotalAmount(items);
      expect(total).toBe(111.93); // 7 * 15.99
    });
  });

  describe('calculateFinalAmount', () => {
    it('should return same amount as total (no additional processing)', () => {
      expect(ImportOrderHelper.calculateFinalAmount(1000)).toBe(1000);
      expect(ImportOrderHelper.calculateFinalAmount(0)).toBe(0);
      expect(ImportOrderHelper.calculateFinalAmount(999.99)).toBe(999.99);
    });
  });

  describe('isEditable', () => {
    it('should allow editing draft orders', () => {
      expect(ImportOrderHelper.isEditable('draft')).toBe(true);
    });

    it('should allow editing pending orders', () => {
      expect(ImportOrderHelper.isEditable('pending')).toBe(true);
    });

    it('should not allow editing received orders', () => {
      expect(ImportOrderHelper.isEditable('received')).toBe(false);
    });

    it('should not allow editing cancelled orders', () => {
      expect(ImportOrderHelper.isEditable('cancelled')).toBe(false);
    });

    it('should not allow editing partial orders', () => {
      expect(ImportOrderHelper.isEditable('partial')).toBe(false);
    });
  });

  describe('isDeletable', () => {
    it('should allow deleting draft orders', () => {
      expect(ImportOrderHelper.isDeletable('draft')).toBe(true);
    });

    it('should not allow deleting pending orders', () => {
      expect(ImportOrderHelper.isDeletable('pending')).toBe(false);
    });

    it('should not allow deleting received orders', () => {
      expect(ImportOrderHelper.isDeletable('received')).toBe(false);
    });

    it('should not allow deleting cancelled orders', () => {
      expect(ImportOrderHelper.isDeletable('cancelled')).toBe(false);
    });

    it('should not allow deleting partial orders', () => {
      expect(ImportOrderHelper.isDeletable('partial')).toBe(false);
    });
  });

  describe('getStatusDisplayName', () => {
    it('should return correct Vietnamese display names', () => {
      expect(ImportOrderHelper.getStatusDisplayName('draft')).toBe('Nháp');
      expect(ImportOrderHelper.getStatusDisplayName('pending')).toBe('Chờ xử lý');
      expect(ImportOrderHelper.getStatusDisplayName('partial')).toBe('Nhận một phần');
      expect(ImportOrderHelper.getStatusDisplayName('received')).toBe('Đã nhận');
      expect(ImportOrderHelper.getStatusDisplayName('cancelled')).toBe('Đã hủy');
    });
  });

  describe('ImportOrderConstants', () => {
    it('should have correct status constants', () => {
      expect(ImportOrderConstants.STATUS.DRAFT).toBe('draft');
      expect(ImportOrderConstants.STATUS.PENDING).toBe('pending');
      expect(ImportOrderConstants.STATUS.PARTIAL).toBe('partial');
      expect(ImportOrderConstants.STATUS.RECEIVED).toBe('received');
      expect(ImportOrderConstants.STATUS.CANCELLED).toBe('cancelled');
    });

    it('should have correct status transitions', () => {
      expect(ImportOrderConstants.STATUS_TRANSITIONS.draft).toEqual(['pending', 'cancelled']);
      expect(ImportOrderConstants.STATUS_TRANSITIONS.pending).toEqual(['partial', 'received', 'cancelled']);
      expect(ImportOrderConstants.STATUS_TRANSITIONS.partial).toEqual(['received', 'cancelled']);
      expect(ImportOrderConstants.STATUS_TRANSITIONS.received).toEqual([]);
      expect(ImportOrderConstants.STATUS_TRANSITIONS.cancelled).toEqual([]);
    });

    it('should have correct order number constants', () => {
      expect(ImportOrderConstants.ORDER_NUMBER_PREFIX).toBe('NK');
      expect(ImportOrderConstants.ORDER_NUMBER_LENGTH).toBe(10);
    });
  });
}); 