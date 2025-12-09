import * as fs from 'fs';
import * as path from 'path';

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

/**
 * OCPP 1.6 JSON Schema Validator
 *
 * Loads official OCPP 1.6 JSON schemas from files
 * and validates payloads against them.
 *
 * CLEAN Architecture: Infrastructure layer utility
 * - Validates message structure conformance
 * - Does NOT contain business logic
 */

const ajv = new Ajv({
  strict: false,
  loadSchema: async (uri: string) => {
    if (uri === 'http://json-schema.org/draft-04/schema#') {
      return { type: 'object', properties: {} };
    }
    throw new Error(`Unknown schema URI: ${uri}`);
  },
});
addFormats(ajv);

// Lazy-load schemas from files
const schemaCache = new Map<string, any>();

function loadSchema(schemaFileName: string): any {
  if (schemaCache.has(schemaFileName)) {
    return schemaCache.get(schemaFileName);
  }

  const schemaPath = path.join(process.cwd(), 'test/schemas/json', schemaFileName);

  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found: ${schemaPath}`);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  const schema = JSON.parse(schemaContent);

  // Remove draft-04 specific keywords that cause issues with modern AJV
  delete schema.$schema;
  delete schema.id;
  delete schema.title;

  schemaCache.set(schemaFileName, schema);
  return schema;
}

/**
 * Validate a payload against an OCPP 1.6 JSON schema
 *
 * @param payload - The message payload to validate
 * @param schemaFileName - Name of the JSON schema file (e.g., 'BootNotification.json')
 * @returns { valid: boolean, errors?: string[] }
 */
export function validateOCPPMessage(
  payload: unknown,
  schemaFileName: string,
): { valid: boolean; errors?: string[] } {
  try {
    const schema = loadSchema(schemaFileName);
    const validate = ajv.compile(schema);
    const valid = validate(payload);

    if (valid) {
      return { valid: true };
    }

    const errors =
      validate.errors?.map((err) => {
        const path = err.instancePath || '<root>';
        return `${path}: ${err.message}`;
      }) || [];

    return { valid: false, errors };
  } catch (error: unknown) {
    return {
      valid: false,
      errors: [`Validation error: ${error.message}`],
    };
  }
}

/**
 * Assert that a payload is valid against an OCPP schema
 * Throws if invalid (useful for tests)
 */
export function assertOCPPMessageValid(payload: unknown, schemaFileName: string): void {
  const result = validateOCPPMessage(payload, schemaFileName);

  if (!result.valid) {
    const errorMessage = result.errors?.join('\n') || 'Unknown validation error';
    throw new Error(`OCPP Schema Validation Failed (${schemaFileName}):\n${errorMessage}`);
  }
}
