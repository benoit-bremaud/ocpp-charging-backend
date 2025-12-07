import { Measurand } from '../../enums';
import { UnitOfMeasure } from '../../enums';
import { ValueFormat } from '../../enums';
import { ReadingContext } from '../../enums';
import { Phase } from '../../enums';

/**
 * OCPP 1.6 Edition 2 § 7.34 - SampledValue
 * Single sampled value with metadata
 *
 * @see https://www.openchargealliance.org/protocols/ocpp-v16/
 */
export interface SampledValue {
  value: string;
  context?: ReadingContext;
  format?: ValueFormat;
  measurand?: Measurand;
  phase?: Phase;
  unit?: UnitOfMeasure;
}
