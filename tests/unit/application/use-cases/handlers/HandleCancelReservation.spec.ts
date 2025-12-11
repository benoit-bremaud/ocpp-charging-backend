import { HandleCancelReservation } from '@/application/use-cases/HandleCancelReservation';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';
import { CancelReservationInput } from '@/application/dto/input/CancelReservationInput';

describe('HandleCancelReservation', () => {
  let useCase: HandleCancelReservation;

  beforeEach(() => {
    useCase = new HandleCancelReservation();
  });

  describe('execute', () => {
    it('should return Accepted status', async () => {
      const input: CancelReservationInput = { reservationId: 1 };

      const result = await useCase.execute('cp-001', input);

      expect(result.status).toBe('Accepted');
    });

    it('should handle multiple cancellations', async () => {
      for (let i = 1; i <= 5; i++) {
        const input: CancelReservationInput = { reservationId: i };
        const result = await useCase.execute('cp-001', input);
        expect(result.status).toBe('Accepted');
      }
    });
  });
});
