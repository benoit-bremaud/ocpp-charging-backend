import { Injectable } from '@nestjs/common';

/**
 * Factory Pattern: Construire les réponses OCPP
 *
 * Format OCPP:
 * - [3, messageId, payload] = CallResult (succès)
 * - [4, messageId, errorCode, errorMsg] = CallError (erreur)
 */
@Injectable()
export class ResponseBuilder {
  /**
   * Construire une réponse OCPP valide [3, messageId, payload]
   */
  buildCallResult(
    messageId: string,
    payload: Record<string, unknown>,
  ): [number, string, Record<string, unknown>] {
    return [3, messageId, payload];
  }

  /**
   * Construire une erreur OCPP [4, messageId, errorCode, errorMessage]
   */
  buildCallError(
    messageId: string,
    errorCode:
      | 'NotImplemented'
      | 'NotSupported'
      | 'InternalError'
      | 'ProtocolError'
      | 'SecurityError',
    errorMessage: string,
  ): [number, string, string, string] {
    return [4, messageId, errorCode, errorMessage];
  }

  /**
   * Builder helper pour réponses courantes
   */
  buildEmptyResponse(messageId: string): [number, string, Record<string, unknown>] {
    return this.buildCallResult(messageId, {});
  }

  /**
   * Builder pour réponses avec status
   */
  buildStatusResponse(messageId: string, status: string): [number, string, Record<string, unknown>] {
    return this.buildCallResult(messageId, { status });
  }
}
