import { BootNotificationMessage } from '@/domain/ocpp-messages/BootNotification';

describe('BootNotificationMessage', () => {
  it('should create valid BootNotification request', () => {
    const payload = {
      chargePointVendor: 'Tesla',
      chargePointModel: 'Model S',
    };

    const msg = BootNotificationMessage.fromOcppPayload(payload);
    expect(msg.chargePointVendor).toBe('Tesla');
  });

  it('should reject invalid payload (non-object)', () => {
    expect(() => {
      BootNotificationMessage.fromOcppPayload('invalid');
    }).toThrow();
  });
});
