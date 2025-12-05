import { ChargePoint } from '../../domain/entities/ChargePoint.entity';

/**
 * DTO: Update ChargePoint input.
 *
 * CLEAN: Application layer, no persistence details.
 * Only optional fields (user can update any subset).
 */
export interface UpdateChargePointInput {
  chargePointModel?: string;
  chargePointVendor?: string;
  firmwareVersion?: string;
  iccid?: string | null;
  imsi?: string | null;
  webSocketUrl?: string | null;
}

/**
 * Map DTO to entity data for persistence.
 */
export function toChargePointEntityDataForUpdate(
  input: UpdateChargePointInput,
): Partial<ChargePoint> {
  const data: Partial<ChargePoint> = {};

  if (input.chargePointModel !== undefined) {
    data.chargePointModel = input.chargePointModel;
  }
  if (input.chargePointVendor !== undefined) {
    data.chargePointVendor = input.chargePointVendor;
  }
  if (input.firmwareVersion !== undefined) {
    data.firmwareVersion = input.firmwareVersion;
  }
  if (input.iccid !== undefined) {
    data.iccid = input.iccid;
  }
  if (input.imsi !== undefined) {
    data.imsi = input.imsi;
  }
  if (input.webSocketUrl !== undefined) {
    data.webSocketUrl = input.webSocketUrl;
  }

  return data;
}
