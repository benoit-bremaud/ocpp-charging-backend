import { ProcessOcppMessage } from '../ProcessOcppMessage';
import { OcppMessageInput } from '../../dto/OcppMessageInput';

describe('ProcessOcppMessage Use-Case', () => {
  let useCase: ProcessOcppMessage;

  beforeEach(() => {
    useCase = new ProcessOcppMessage();
  });

  it('should process valid CALL message', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-001',
      action: 'BootNotification',
      payload: { chargePointModel: 'Tesla', chargePointVendor: 'Tesla Inc' },
    };

    const result = await useCase.execute(input);

    expect(result).toBeDefined();
  });

  it('should return error for unknown action', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 2,
      messageId: 'msg-002',
      action: 'UnknownAction',
      payload: {},
    };

    const result = await useCase.execute(input);

    expect(result).toEqual([
      4,
      'msg-002',
      'NotImplemented',
      'Handler for UnknownAction not implemented',
    ]);
  });

  it('should ignore non-CALL messages', async () => {
    const input: OcppMessageInput = {
      messageTypeId: 3,
      messageId: 'msg-003',
      action: 'BootNotification',
      payload: {},
    };

    const result = await useCase.execute(input);

    expect(result).toEqual({ status: 'ignored' });
  });
});
