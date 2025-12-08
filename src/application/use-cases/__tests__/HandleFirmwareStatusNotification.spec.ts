import { HandleFirmwareStatusNotification } from '../HandleFirmwareStatusNotification';
const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';
import { FirmwareStatusNotificationInput } from '../../dto/input/FirmwareStatusNotificationInput';

describe('HandleFirmwareStatusNotification', () => {
  let useCase: HandleFirmwareStatusNotification;

  beforeEach(() => {
    useCase = new HandleFirmwareStatusNotification();
  });

  describe('execute', () => {
    it('should return empty response', async () => {
      const input: FirmwareStatusNotificationInput = {
        status: 'Downloaded'
      };

      const result = await useCase.execute('cp-001', input);

      expect(result).toBeDefined();
    });

    it('should handle different firmware statuses', async () => {
      const statuses: Array<'Downloaded' | 'Downloading' | 'Idle' | 'InstallationFailed' | 'Installing' | 'Installed'> = [
        'Downloaded',
        'Downloading',
        'Idle',
        'InstallationFailed',
        'Installing',
        'Installed'
      ];

      for (const status of statuses) {
        const input: FirmwareStatusNotificationInput = { status };
        const result = await useCase.execute('cp-001', input);
        expect(result).toBeDefined();
      }
    });
  });
});
