import { HandleReserveNow } from '../HandleReserveNow';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';
import { ReserveNowInput } from '../../dto/input/ReserveNowInput';

describe('HandleReserveNow', () => {
  let useCase: HandleReserveNow;

  beforeEach(() => {
    useCase = new HandleReserveNow();
  });

  describe('execute', () => {
    it('should return Accepted status', async () => {
      const input: ReserveNowInput = {
        connectorId: 1,
        expiryDate: '2025-12-09',
        idTag: 'tag-123',
        reservationId: 1,
      };

      const result = await useCase.execute('cp-001', input);

      expect(result.status).toBe('Accepted');
    });

    it('should handle reservation with parent tag', async () => {
      const input: ReserveNowInput = {
        connectorId: 1,
        expiryDate: '2025-12-09',
        idTag: 'tag-123',
        parentIdTag: 'parent-tag',
        reservationId: 1,
      };

      const result = await useCase.execute('cp-001', input);

      expect(result.status).toBe('Accepted');
    });
  });
});
