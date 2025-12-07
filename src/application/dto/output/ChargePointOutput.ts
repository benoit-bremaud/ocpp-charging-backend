/**
 * ChargePointOutput DTO
 *
 * Data Transfer Object pour la réponse des informations d'une borne de recharge
 *
 * OCPP 1.6 - Charge Point Information Response
 */
export class ChargePointOutput {
  id: string = '';
  chargePointId: string = '';
  model: string = '';
  vendor: string = '';
  firmwareVersion?: string;
  serialNumber?: string;
}
