/**
 * OCPP 1.6 § 3.3 - ReserveNow Request
 */
export class ReserveNowInput {
  connectorId: number = 0;
  expiryDate: string = '';
  idTag: string = '';
  parentIdTag?: string;
  reservationId: number = 0;
}
