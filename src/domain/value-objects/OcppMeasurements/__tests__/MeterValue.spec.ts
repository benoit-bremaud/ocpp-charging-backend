import { Measurand } from '../../../enums/metering/Measurand';
import { MeterValue } from '../MeterValue';
import { SampledValue } from '../SampledValue';

describe('MeterValue', () => {
  describe('structure validation', () => {
    it('should create a valid MeterValue with required fields', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [],
      };
      expect(meterValue).toBeDefined();
      expect(meterValue.timestamp).toBe('2024-01-01T10:00:00Z');
      expect(meterValue.sampledValue).toEqual([]);
    });

    it('should accept ISO 8601 timestamp format', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-12-07T15:48:00.000Z',
        sampledValue: [],
      };
      expect(meterValue.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should accept array of SampledValue objects', () => {
      const sampledValue: SampledValue = {
        value: '100',
        measurand: Measurand.EnergyActiveImportRegister,
      };
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [sampledValue],
      };
      expect(meterValue.sampledValue).toHaveLength(1);
      expect(meterValue.sampledValue[0].value).toBe('100');
    });

    it('should accept multiple SampledValue objects', () => {
      const sampledValues: SampledValue[] = [
        { value: '100', measurand: Measurand.EnergyActiveImportRegister },
        { value: '50', measurand: Measurand.PowerActiveImport },
        { value: '25', measurand: Measurand.Voltage },
      ];
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: sampledValues,
      };
      expect(meterValue.sampledValue).toHaveLength(3);
    });

    it('should have timestamp as string', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [],
      };
      expect(typeof meterValue.timestamp).toBe('string');
    });

    it('should have sampledValue as array', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [],
      };
      expect(Array.isArray(meterValue.sampledValue)).toBe(true);
    });

    it('should allow empty sampledValue array', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [],
      };
      expect(meterValue.sampledValue.length).toBe(0);
    });

    it('should maintain data integrity', () => {
      const sampledValue: SampledValue = {
        value: '123.45',
        measurand: Measurand.EnergyActiveImportRegister,
      };
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:00:00Z',
        sampledValue: [sampledValue],
      };
      expect(meterValue.sampledValue[0]).toEqual(sampledValue);
    });
  });

  describe('real-world scenarios', () => {
    it('should represent meter reading with energy value', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:30:00Z',
        sampledValue: [
          { 
            value: '1234.56',
            measurand: Measurand.EnergyActiveImportRegister 
          }
        ],
      };
      expect(meterValue.sampledValue[0].value).toBe('1234.56');
    });

    it('should represent meter reading with multiple metrics', () => {
      const meterValue: MeterValue = {
        timestamp: '2024-01-01T10:30:00Z',
        sampledValue: [
          { value: '1234.56', measurand: Measurand.EnergyActiveImportRegister },
          { value: '22.5', measurand: Measurand.PowerActiveImport },
          { value: '230', measurand: Measurand.Voltage },
          { value: '10', measurand: Measurand.Current },
        ],
      };
      expect(meterValue.sampledValue).toHaveLength(4);
    });
  });
});
