/**
 * Domain Layer: OCPP 1.6 JSON Schema validation with dynamic loading.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface PropertySchema {
  type?: string;
  enum?: unknown[];
  maxLength?: number;
  minimum?: number;
  format?: string;
  minLength?: number;
}

export interface OcppSchemaDefinition {
  type: 'object';
  properties: Record<string, PropertySchema>;
  required?: string[];
  additionalProperties: boolean;
}

export class OcppSchema {
  private static readonly SCHEMAS: Record<string, OcppSchemaDefinition> =
    OcppSchema.loadSchemasFromDisk();

  private static loadSchemasFromDisk(): Record<string, OcppSchemaDefinition> {
    const schemas: Record<string, OcppSchemaDefinition> = {};

    try {
      // Essayer d'abord depuis src/, puis depuis tests/
      let schemasDir = path.resolve(__dirname, '../../../src/domain/value-objects/schemas');

      if (!fs.existsSync(schemasDir)) {
        schemasDir = path.resolve(__dirname, '../../../../tests/e2e/schemas/json');
      }

      if (!fs.existsSync(schemasDir)) {

        console.warn(`[OcppSchema] Schemas directory not found`);
        return schemas;
      }

      const files = fs
        .readdirSync(schemasDir)
        .filter((file) => file.endsWith('.json'))
        .sort();

      console.log(`[OcppSchema] Loading ${files.length} schemas from ${schemasDir}`);

      files.forEach((file) => {
        try {
          const actionName = path.basename(file, '.json');
          const filePath = path.join(schemasDir, file);
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const schema = JSON.parse(rawContent) as OcppSchemaDefinition;

          if (!OcppSchema.isValidSchema(schema)) {
            console.warn(`[OcppSchema] Invalid schema structure in ${file}`);
            return;
          }

          schemas[actionName] = schema;
          console.log(`[OcppSchema] Loaded: ${actionName}`);
        } catch (fileError) {
          const error = fileError as Error;
          console.error(`[OcppSchema] Error loading ${file}: ${error.message}`);
        }
      });

      console.log(`[OcppSchema] Successfully loaded ${Object.keys(schemas).length} schemas`);
    } catch (error) {
      const err = error as Error;
      console.error(`[OcppSchema] Fatal error loading schemas: ${err.message}`);
    }

    return schemas;
  }

  private static isValidSchema(obj: unknown): obj is OcppSchemaDefinition {
    if (typeof obj !== 'object' || obj === null) return false;
    const schema = obj as Record<string, unknown>;
    return (
      schema.type === 'object' &&
      typeof schema.properties === 'object' &&
      (Array.isArray(schema.required) || schema.required === undefined) &&
      typeof schema.additionalProperties === 'boolean'
    );
  }

  static validate(
    action: string,
    payload: Record<string, unknown>,
  ): { valid: boolean; errors?: string[] } {
    const schema = this.SCHEMAS[action];

    if (!schema) {
      const available = Object.keys(this.SCHEMAS).sort();
      return {
        valid: false,
        errors: [
          `No schema defined for action: ${action}. Available schemas: ${available.length > 0 ? available.join(', ') : 'NONE LOADED'}`,
        ],
      };
    }

    const errors: string[] = [];

    if (schema.required) {
      for (const required of schema.required) {
        if (!(required in payload)) {
          errors.push(`Missing required field: ${required}`);
        }
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
      const propSchema = schema.properties[key] as PropertySchema | undefined;
      if (!propSchema) continue;

      if (propSchema.type === 'integer' && typeof value !== 'number') {
        errors.push(`Field '${key}' must be integer, got: ${typeof value}`);
      } else if (propSchema.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${key}' must be string, got: ${typeof value}`);
      }

      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(`Field '${key}' must be one of [${propSchema.enum.join(', ')}], got: ${value}`);
      }

      if (propSchema.maxLength && typeof value === 'string') {
        if (value.length > propSchema.maxLength) {
          errors.push(`Field '${key}' exceeds max length ${propSchema.maxLength}`);
        }
      }

      if (propSchema.minLength && typeof value === 'string') {
        if (value.length < propSchema.minLength) {
          errors.push(`Field '${key}' below min length ${propSchema.minLength}`);
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
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{0,3})?Z?$/;
    return iso8601Regex.test(value);
  }
}
