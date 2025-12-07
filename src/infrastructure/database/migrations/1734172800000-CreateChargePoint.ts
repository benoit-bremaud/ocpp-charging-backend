import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateChargePoint1734172800000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create ChargePoint table
    await queryRunner.createTable(
      new Table({
        name: 'charge_points',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'identifier',
            type: 'varchar',
            isUnique: true,
            length: '255',
          },
          {
            name: 'vendor_name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'model',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'serial_number',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'firmware_version',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'protocol_version',
            type: 'varchar',
            length: '10',
            default: "'1.6'",
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'Available'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'last_heartbeat_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
        indices: [
          {
            columnNames: ['identifier'],
            isUnique: true,
          },
          {
            columnNames: ['status'],
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop table (indices are dropped automatically)
    await queryRunner.dropTable('charge_points');
  }
}
