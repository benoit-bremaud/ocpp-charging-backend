import { ChargePoint } from '../../domain/entities/ChargePoint.entity';

/**
 * DTO for creating a new ChargePoint.
 *
 * CLEAN: Application-layer DTO (no persistence details).
 * Only expresses business data needed to create a ChargePoint.
 */
export interface CreateChargePointInput {
  chargePointId: string;
  chargePointModel: string;
  chargePointVendor: string;
  firmwareVersion: string;
  iccid?: string | null;
  imsi?: string | null;
  webSocketUrl?: string | null;
}

/**
 * Helper to map input DTO to a Partial<ChargePoint> entity.
 * Keeps mapping logic in one place.
 */
export function toChargePointEntityData(
  input: CreateChargePointInput,
): Partial<ChargePoint> {
  return {
    chargePointId: input.chargePointId,
    chargePointModel: input.chargePointModel,
    chargePointVendor: input.chargePointVendor,
    firmwareVersion: input.firmwareVersion,
    iccid: input.iccid ?? null,
    imsi: input.imsi ?? null,
    webSocketUrl: input.webSocketUrl ?? null,
  };
}
