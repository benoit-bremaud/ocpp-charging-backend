/**
 * Dependency Injection tokens for Infrastructure layer.
 * Separated from modules to avoid circular imports.
 *
 * SOLID: DIP - symbolic tokens for abstraction binding
 */

/**
 * Token for IChargePointRepository binding.
 * Used to inject repository abstraction into use-cases.
 */
export const CHARGE_POINT_REPOSITORY_TOKEN = 'IChargePointRepository';
