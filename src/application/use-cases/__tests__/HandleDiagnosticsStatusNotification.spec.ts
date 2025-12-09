import { HandleDiagnosticsStatusNotification } from '../HandleDiagnosticsStatusNotification';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';
import { DiagnosticsStatusNotificationInput } from '../../dto/input/DiagnosticsStatusNotificationInput';

describe('HandleDiagnosticsStatusNotification', () => {
  let useCase: HandleDiagnosticsStatusNotification;

  beforeEach(() => {
    useCase = new HandleDiagnosticsStatusNotification();
  });

  describe('execute', () => {
    it('should handle Idle status', async () => {
      const input: DiagnosticsStatusNotificationInput = { status: 'Idle' };
      const result = await useCase.execute('cp-001', input);
      expect(result).toBeDefined();
    });

    it('should handle Uploading status', async () => {
      const input: DiagnosticsStatusNotificationInput = { status: 'Uploading' };
      const result = await useCase.execute('cp-001', input);
      expect(result).toBeDefined();
    });

    it('should handle UploadFailed status', async () => {
      const input: DiagnosticsStatusNotificationInput = { status: 'UploadFailed' };
      const result = await useCase.execute('cp-001', input);
      expect(result).toBeDefined();
    });
  });
});
