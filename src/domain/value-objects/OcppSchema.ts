/**
 * Domain Layer: OCPP 1.6 JSON Schema validation.
 *
 * Per OCPP 1.6 spec, every message MUST conform to a strict JSON schema.
 * This enforces FormationViolation errors early.
 *
 * CLEAN: Pure domain logic, no framework deps.
 * SOLID: SRP - validates schemas only.
 */

export interface OcppSchemaDefinition {
  type: 'object';
  properties: Record<string, any>;
  required: string[];
  additionalProperties: boolean;
}

export class OcppSchema {
  private static readonly SCHEMAS: Record<string, OcppSchemaDefinition> = {
    BootNotification: {
      type: 'object',
      properties: {
        chargePointModel: { type: 'string', maxLength: 50 },
        chargePointVendor: { type: 'string', maxLength: 50 },
        chargePointSerialNumber: { type: 'string', maxLength: 25 },
        chargeBoxSerialNumber: { type: 'string', maxLength: 25 },
        firmwareVersion: { type: 'string', maxLength: 50 },
        iccid: { type: 'string', maxLength: 20 },
        imsi: { type: 'string', maxLength: 20 },
        meterSerialNumber: { type: 'string', maxLength: 25 },
        meterType: { type: 'string', maxLength: 25 },
      },
      required: ['chargePointModel', 'chargePointVendor'],
      additionalProperties: false,
    },

    Heartbeat: {
      type: 'object',
      properties: {},
      required: [],
      additionalProperties: false,
    },

    StatusNotification: {
      type: 'object',
      properties: {
        connectorId: { type: 'integer', minimum: 0 },
        errorCode: {
          type: 'string',
          enum: [
            'NoError',
            'ConnectorLockFailure',
            'EVCommunicationError',
            'GroundFailure',
            'HighTemperature',
            'InternalError',
            'LocalListConflict',
            'OtherError',
            'OverCurrentFailure',
            'OverVoltage',
            'PowerMeterFailure',
            'PowerSwitchFailure',
            'ReaderFailure',
            'ResetFailure',
            'UnderVoltage',
            'WeakSignal',
          ],
        },
        status: {
          type: 'string',
          enum: ['Available', 'Occupied', 'Reserved', 'Unavailable', 'Faulted'],
        },
        timestamp: { type: 'string', format: 'date-time' },
        vendorId: { type: 'string', maxLength: 255 },
        vendorErrorCode: { type: 'string', maxLength: 50 },
      },
      required: ['connectorId', 'errorCode', 'status', 'timestamp'],
      additionalProperties: false,
    },

    Authorize: {
      type: 'object',
      properties: {
        idTag: { type: 'string', minLength: 1, maxLength: 20 },
      },
      required: ['idTag'],
      additionalProperties: false,
    },
  };

  static validate(
    action: string,
    payload: Record<string, any>,
  ): { valid: boolean; errors?: string[] } {
    const schema = this.SCHEMAS[action];

    if (!schema) {
      return {
        valid: false,
        errors: [`No schema defined for action: ${action}`],
      };
    }

    const errors: string[] = [];

    for (const required of schema.required) {
      if (!(required in payload)) {
        errors.push(`Missing required field: ${required}`);
      }
    }

    if (!schema.additionalProperties) {
      for (const key of Object.keys(payload)) {
        if (!(key in schema.properties)) {
          errors.push(`Additional property not allowed: ${key}`);
        }
      }
    }

    for (const [key, value] of Object.entries(payload)) {
      const propSchema = schema.properties[key];

      if (!propSchema) continue;

      if (propSchema.type === 'integer' && typeof value !== 'number') {
        errors.push(`Field '${key}' must be integer, got: ${typeof value}`);
      } else if (propSchema.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${key}' must be string, got: ${typeof value}`);
      } else if (propSchema.type === 'object' && typeof value !== 'object') {
        errors.push(`Field '${key}' must be object, got: ${typeof value}`);
      }

      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(`Field '${key}' must be one of [${propSchema.enum.join(', ')}], got: ${value}`);
      }

      if (propSchema.maxLength && typeof value === 'string') {
        if (value.length > propSchema.maxLength) {
          errors.push(`Field '${key}' exceeds max length ${propSchema.maxLength}`);
        }
      }

      if (propSchema.minimum !== undefined && typeof value === 'number') {
        if (value < propSchema.minimum) {
          errors.push(`Field '${key}' must be >= ${propSchema.minimum}, got: ${value}`);
        }
      }

      if (propSchema.format === 'date-time' && typeof value === 'string') {
        if (!this.isValidIso8601(value)) {
          errors.push(`Field '${key}' must be ISO 8601 timestamp, got: ${value}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  private static isValidIso8601(value: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.?\d{0,3})?Z?$/;
    return iso8601Regex.test(value);
  }

  static getSchema(action: string): OcppSchemaDefinition | null {
    return this.SCHEMAS[action] || null;
  }
}
