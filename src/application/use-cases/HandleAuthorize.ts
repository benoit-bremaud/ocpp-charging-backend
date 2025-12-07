import { Injectable, Logger } from '@nestjs/common';
import { buildFormationViolation, buildGenericError } from '../dto/OcppResponseBuilders';

import { OcppCallRequest } from '../dto/OcppProtocol';
import { OcppContext } from '../../domain/value-objects/OcppContext';
import { OcppSchema } from '../../domain/value-objects/OcppSchema';

/**
 * Use-Case: Handle OCPP Authorize Request (OCPP 1.6 Spec)
 *
 * Per OCPP 1.6 specification:
 * - Authorize: Request from ChargePoint to authorize a user via idTag
 * - Format: [2, messageId, "Authorize", {idTag: string}]
 * - Response: [3, messageId, {idTagInfo: {status, expiryDate, ...}}]
 *
 * CLEAN Architecture:
 * - No dependencies on NestJS, HTTP, or external systems
 * - Pure business logic: validate idTag, determine authorization
 * - Returns wire format response (array serialized by caller)
 */
@Injectable()
export class HandleAuthorize {
  private logger = new Logger('HandleAuthorize');

  /**
   * Execute Authorize request
   * @param message OCPP CALL request (type 2)
   * @param context OCPP context (chargePointId, messageId, action)
   * @returns OCPP CALL_RESULT or CALL_ERROR response (array)
   */
  async execute(message: OcppCallRequest, context: OcppContext): Promise<any> {
    // Validate message type
    if (message.messageTypeId !== 2) {
      this.logger.error(
        `Authorize expects CALL message (type 2), got type ${message.messageTypeId}`,
      );
      return buildGenericError(context.messageId, 'Expected CALL message type');
    }

    // Validate against schema
    const validation = OcppSchema.validate('Authorize', message.payload);
    if (!validation.valid) {
      this.logger.warn(`Authorize validation failed: ${validation.errors?.join(', ')}`);
      return buildFormationViolation(
        context.messageId,
        validation.errors?.join(', ') || 'Schema validation failed',
      );
    }

    // Extract idTag from payload
    const { idTag } = message.payload as { idTag: string };
    this.logger.log(`Authorizing idTag: ${idTag} from ${context.chargePointId}`);

    // BUSINESS LOGIC: Determine authorization status
    // (In production, query database or identity provider)
    const authorizationStatus = this.determineStatus(idTag);

    // Build response per OCPP 1.6 spec
    const response: any = [
      3,
      context.messageId,
      {
        idTagInfo: {
          status: authorizationStatus,
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        },
      },
    ];

    this.logger.log(`Authorize response: ${authorizationStatus} for ${idTag}`);
    return response;
  }

  /**
   * Determine authorization status based on idTag
   * SIMPLE IMPLEMENTATION - Replace with real logic
   *
   * Per OCPP 1.6 Spec, valid statuses:
   * - Accepted: Tag is valid, authorization granted
   * - Blocked: Tag is blocked, authorization denied
   * - Expired: Tag is expired, authorization denied
   * - Invalid: Tag format is invalid
   * - ConcurrentTx: ChargePoint has concurrent transaction
   */
  private determineStatus(idTag: string): 'Accepted' | 'Blocked' | 'Expired' | 'Invalid' {
    // Validate idTag format (must be 3-20 alphanumeric characters)
    if (!idTag || idTag.length < 3 || idTag.length > 20) {
      return 'Invalid';
    }

    // Check against blocked list (hardcoded for demo)
    const blockedTags = ['BLOCKED', 'REVOKED'];
    if (blockedTags.includes(idTag.toUpperCase())) {
      return 'Blocked';
    }

    // Check against expired list (hardcoded for demo)
    const expiredTags = ['EXPIRED'];
    if (expiredTags.includes(idTag.toUpperCase())) {
      return 'Expired';
    }

    // Default: Accept
    return 'Accepted';
  }
}
