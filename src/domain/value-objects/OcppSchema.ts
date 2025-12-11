/**
 * Domain Layer: OCPP 1.6 JSON Schema validation with dynamic loading.
 *
 * Per OCPP 1.6 spec, every message MUST conform to a strict JSON schema.
 * This enforces FormationViolation errors early.
 *
 * ✅ DYNAMIC LOADING: Schemas loaded from test/schemas/json/*.json
 * ✅ SINGLE SOURCE OF TRUTH: One definition per schema
 * ✅ AUTO-SYNC: Add/modify schema = automatic everywhere
 * ✅ SCALABLE: Works with 57 schemas or 500 schemas
 *
 * CLEAN: Pure domain logic, no framework deps.
 * SOLID: SRP - validates schemas only.
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
  required: string[];
  additionalProperties: boolean;
}

export class OcppSchema {
  /**
   * ⚡ Static cache of all OCPP 1.6 schemas
   * Loaded ONCE at application startup via loadSchemasFromDisk()
   * Readonly to prevent accidental modifications
   */
  private static readonly SCHEMAS: Record<string, OcppSchemaDefinition> =
    OcppSchema.loadSchemasFromDisk();

  /**
   * Load all OCPP 1.6 schemas from test/schemas/json directory.
   * This ensures a single source of truth - schemas are defined once in JSON.
   *
   * 🎯 How it works:
   * 1. Finds test/schemas/json directory
   * 2. Reads ALL *.json files
   * 3. Parses each JSON file
   * 4. Validates schema structure
   * 5. Stores in memory for fast lookup
   *
   * ✅ Automatic sync: Add StartTransaction.json → automatically available
   * ✅ No duplication: JSON is the source, TypeScript just loads it
   * ✅ Scalable: Works with 10 or 100 schemas
   *
   * @returns Record mapping action names to their JSON schemas
   */
  private static loadSchemasFromDisk(): Record<string, OcppSchemaDefinition> {
    const schemas: Record<string, OcppSchemaDefinition> = {};

    try {
      // 🔍 Locate the schemas directory
      // From: src/domain/value-objects/OcppSchema.ts
      // To:   test/schemas/json/
      // Path: ../../../test/schemas/json
      const schemasDir = path.resolve(__dirname, '../../../test/schemas/json');

      // ✅ Verify directory exists
      if (!fs.existsSync(schemasDir)) {
        console.warn(`[OcppSchema] ⚠️  Schemas directory not found: ${schemasDir}`);
        return schemas;
      }

      // 📂 Read all JSON files from directory
      const files = fs
        .readdirSync(schemasDir)
        .filter((file) => file.endsWith('.json'))
        .sort(); // Consistent order for reproducibility

      console.log(`[OcppSchema] 📖 Loading ${files.length} schemas from ${schemasDir}`);

      // 📖 Load each schema file
      files.forEach((file) => {
        try {
          // Extract action name: "StartTransaction.json" → "StartTransaction"
          const actionName = path.basename(file, '.json');
          const filePath = path.join(schemasDir, file);

          // Read and parse JSON
          const rawContent = fs.readFileSync(filePath, 'utf-8');
          const schema = JSON.parse(rawContent) as OcppSchemaDefinition;

          // ✅ Validate schema structure
          if (!OcppSchema.isValidSchema(schema)) {
            console.warn(
              `[OcppSchema] ⚠️  Invalid schema structure in ${file}: missing required fields`,
            );
            return;
          }

          // ✅ Store schema in memory
          schemas[actionName] = schema;
          console.log(`[OcppSchema] ✓ Loaded: ${actionName}`);
        } catch (fileError) {
          const error = fileError as Error;
          console.error(`[OcppSchema] ❌ Error loading ${file}: ${error.message}`);
          // Continue with next file
        }
      });

      console.log(`[OcppSchema] ✅ Successfully loaded ${Object.keys(schemas).length} schemas`);
    } catch (error) {
      const err = error as Error;
      console.error(`[OcppSchema] ❌ Fatal error loading schemas: ${err.message}`);
    }

    return schemas;
  }

  /**
   * Validate that a loaded JSON file has the correct schema structure.
   * Prevents loading malformed schema definitions.
   *
   * @param obj The loaded JSON object
   * @returns true if valid schema structure, false otherwise
   */
  private static isValidSchema(obj: unknown): obj is OcppSchemaDefinition {
    if (typeof obj !== 'object' || obj === null) return false;

    const schema = obj as Record<string, unknown>;

    return (
      schema.type === 'object' &&
      typeof schema.properties === 'object' &&
      Array.isArray(schema.required) &&
      typeof schema.additionalProperties === 'boolean'
    );
  }

  /**
   * Validate a message payload against a schema.
   *
   * @param action OCPP action name (e.g., "StartTransaction")
   * @param payload Message payload to validate
   * @returns Validation result: { valid: boolean; errors?: string[] }
   *
   * Example:
   * const result = OcppSchema.validate('StartTransaction', {
   *   connectorId: 1,
   *   idTag: 'DRIVER123',
   *   meterStart: 1000
   * });
   * if (!result.valid) {
   *   console.log(result.errors); // ['Field X is required', ...]
   * }
   */
  static validate(
    action: string,
    payload: Record<string, unknown>,
  ): { valid: boolean; errors?: string[] } {
    // 🔍 Lookup schema for this action
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

    // ✅ Step 1: Check required fields
    for (const required of schema.required) {
      if (!(required in payload)) {
        errors.push(`Missing required field: ${required}`);
      }
    }

    // ✅ Step 2: Check for additional properties
    if (!schema.additionalProperties) {
      for (const key of Object.keys(payload)) {
        if (!(key in schema.properties)) {
          errors.push(`Additional property not allowed: ${key}`);
        }
      }
    }

    // ✅ Step 3: Validate each property
    for (const [key, value] of Object.entries(payload)) {
      const propSchema = schema.properties[key] as PropertySchema | undefined;

      if (!propSchema) continue;

      // Type validation
      if (propSchema.type === 'integer' && typeof value !== 'number') {
        errors.push(`Field '${key}' must be integer, got: ${typeof value}`);
      } else if (propSchema.type === 'string' && typeof value !== 'string') {
        errors.push(`Field '${key}' must be string, got: ${typeof value}`);
      } else if (propSchema.type === 'object' && typeof value !== 'object') {
        errors.push(`Field '${key}' must be object, got: ${typeof value}`);
      }

      // Enum validation
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push(`Field '${key}' must be one of [${propSchema.enum.join(', ')}], got: ${value}`);
      }

      // String length validation
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

      // Number range validation
      if (propSchema.minimum !== undefined && typeof value === 'number') {
        if (value < propSchema.minimum) {
          errors.push(`Field '${key}' must be >= ${propSchema.minimum}, got: ${value}`);
        }
      }

      // ISO 8601 timestamp validation
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

  /**
   * Validate ISO 8601 timestamp format.
   * Supports: 2024-12-11T15:30:45Z or 2024-12-11T15:30:45.123Z
   *
   * @param value String to validate
   * @returns true if valid ISO 8601, false otherwise
   */
  private static isValidIso8601(value: string): boolean {
    const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{0,3})?Z?$/;
    return iso8601Regex.test(value);
  }

  /**
   * Get a schema by action name.
   *
   * @param action OCPP action name (e.g., "StartTransaction")
   * @returns Schema definition or null if not found
   */
  static getSchema(action: string): OcppSchemaDefinition | null {
    return this.SCHEMAS[action] || null;
  }

  /**
   * Get list of all available schemas.
   * Useful for debugging or documentation.
   *
   * @returns Array of action names that have schemas, sorted alphabetically
   */
  static getAvailableSchemas(): string[] {
    return Object.keys(this.SCHEMAS).sort();
  }
}
