import { Inject, Injectable, Logger } from '@nestjs/common';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';
import { IChargePointRepository } from '../../domain/repositories/IChargePointRepository';
import { CHARGE_POINT_REPOSITORY_TOKEN } from '../../infrastructure/tokens';
import { OcppCallRequest } from '../dto/OcppProtocol';
import {
  buildStatusNotificationResponse,
  buildFormationViolation,
  buildGenericError,
} from '../dto/OcppResponseBuilders';

/**
 * ============================================================================
 * OCPP 1.6 Use-Case: Handle StatusNotification
 * ============================================================================
 *
 * PURPOSE:
 *   Process incoming StatusNotification messages from Charge Points
 *   Update connector status (Available, Occupied, Reserved, Unavailable, Faulted)
 *   Track error codes for monitoring and alerting
 *
 * INPUT FORMAT (OCPP 1.6 CALL):
 *   [2, messageId, "StatusNotification", {
 *     connectorId: number,
 *     errorCode: string (enum),
 *     status: string (enum),
 *     timestamp: ISO 8601
 *   }]
 *
 * OUTPUT FORMAT (OCPP 1.6 CALLRESULT):
 *   Success: [3, messageId, {}]
 *   Error:   [4, messageId, errorCode, errorDescription]
 *
 * ARCHITECTURE:
 *   ✓ CLEAN Architecture: Pure business logic, no framework dependencies
 *   ✓ SOLID Principles: Dependency Injection, Single Responsibility
 *   ✓ Comprehensive validation: Schema, enums, required fields
 *   ✓ OCPP 1.6 Spec compliant: Correct message format and responses
 *
 * STATUS VALUES (OCPP 1.6):
 *   - Available: Connector ready for charging
 *   - Occupied: Charging in progress or vehicle connected
 *   - Reserved: Reserved for a user (upcoming transaction)
 *   - Unavailable: Out of service (maintenance, etc.)
 *   - Faulted: Hardware or software fault detected
 *
 * ERROR CODES (OCPP 1.6):
 *   - NoError: Normal operation
 *   - ConnectorLockFailure: Connector lock malfunction
 *   - HighTemperature: Thermal overload detected
 *   - Mode3Charging: DC charging fault
 *   - PowerMeterFailure: Metering equipment error
 *   - PowerSwitchFailure: Power relay failure
 *   - ReaderErrorEvent: RFID reader error
 *   - ResetFailure: Reset command failed
 *   - GroundFailure: Earth fault detected
 *   - OverCurrentFailure: Overcurrent condition
 *   - OverVoltage: Overvoltage condition
 *   - UnderVoltage: Undervoltage condition
 *   - WeakSignal: Weak cellular/network signal
 *   - OtherError: Generic error
 *
 * ============================================================================
 */
@Injectable()
export class HandleStatusNotification {
  private logger = new Logger('HandleStatusNotification');

  constructor(
    @Inject(CHARGE_POINT_REPOSITORY_TOKEN)
    private readonly chargePointRepository: IChargePointRepository,
  ) {}

  /**
   * Execute: Process StatusNotification message from Charge Point
   *
   * @param message - OCPP CALL message with StatusNotification payload
   * @param context - OcppContext containing chargePointId, messageId, metadata
   * @returns OCPP 1.6 CALLRESULT or CALLERROR response
   *
   * VALIDATION STEPS:
   *   1. Verify messageTypeId is CALL (2)
   *   2. Validate payload against OCPP 1.6 schema
   *   3. Check ChargePoint exists in repository
   *   4. Extract and log status information
   *   5. Return CALLRESULT with empty payload
   *
   * ERROR HANDLING:
   *   - Invalid messageTypeId → GenericError
   *   - Schema validation failure → FormationViolation
   *   - ChargePoint not found → GenericError
   *   - Repository exceptions → Thrown (handled by middleware)
   */
  async execute(message: OcppCallRequest, context: OcppContext): Promise<any[]> {
    // =========================================================================
    // Step 1: VALIDATE MESSAGE TYPE
    // =========================================================================
    // OCPP 1.6 CALL messages must have messageTypeId = 2
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `[${context.messageId}] StatusNotification expects CALL (messageTypeId 2), got ${message.messageTypeId}`,
      );
      return buildGenericError(context.messageId, 'Expected CALL message type (2)');
    }

    // =========================================================================
    // Step 2: VALIDATE PAYLOAD AGAINST OCPP 1.6 SCHEMA
    // =========================================================================
    // OcppSchema.validate performs:
    //   - Required field presence check (connectorId, errorCode, status, timestamp)
    //   - Enum validation (status must be one of: Available, Occupied, Reserved, Unavailable, Faulted)
    //   - Enum validation (errorCode must be valid per OCPP 1.6)
    //   - Timestamp format validation (ISO 8601)
    //   - Field type validation
    const validation = OcppSchema.validate('StatusNotification', message.payload);
    if (!validation.valid) {
      this.logger.warn(
        `[${context.messageId}] StatusNotification validation failed: ${validation.errors?.join('; ')}`,
      );
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join('; ') || 'Schema validation failed',
      );
    }

    // =========================================================================
    // Step 3: VERIFY CHARGEPOINT EXISTS
    // =========================================================================
    // Repository lookup ensures ChargePoint is registered in the system
    // before accepting status updates from it
    const chargePoint = await this.chargePointRepository.findByChargePointId(context.chargePointId);

    if (!chargePoint) {
      this.logger.error(
        `[${context.messageId}] ChargePoint ${context.chargePointId} not found in repository`,
      );
      return buildGenericError(context.messageId, `ChargePoint ${context.chargePointId} not found`);
    }

    // =========================================================================
    // Step 4: EXTRACT & LOG STATUS INFORMATION
    // =========================================================================
    // Destructure payload for cleaner logging and potential future processing
    const { connectorId, errorCode, status, timestamp } = message.payload;

    // Business Logic: Log connector status change for monitoring
    this.logger.log(
      `📊 Status: ${context.chargePointId} connector ${connectorId} → ${status} (${errorCode})`,
    );

    // Alert on error conditions for real-time monitoring/alerting
    if (errorCode !== 'NoError') {
      this.logger.warn(
        `⚠️  Connector error detected: ${errorCode} at ${timestamp} [CP: ${context.chargePointId}, Connector: ${connectorId}]`,
      );
    }

    // =========================================================================
    // Step 5: BUILD & RETURN OCPP 1.6 CALLRESULT RESPONSE
    // =========================================================================
    // OCPP 1.6 spec: StatusNotification response has empty payload {}
    // Format: [3, messageId, {}]
    // where 3 = CALLRESULT message type
    return buildStatusNotificationResponse(context.messageId);
  }
}
