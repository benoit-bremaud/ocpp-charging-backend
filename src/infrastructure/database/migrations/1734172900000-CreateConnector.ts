import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateConnector1734172900000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create connectors table
    await queryRunner.createTable(
      new Table({
        name: 'connectors',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'charge_point_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'connector_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'varchar',
            length: '50',
            default: "'Type2'",
            isNullable: false,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'Available'",
            isNullable: false,
          },
          {
            name: 'power_type',
            type: 'varchar',
            length: '20',
            default: "'AC'",
            isNullable: false,
          },
          {
            name: 'max_voltage',
            type: 'integer',
            default: '230',
            isNullable: false,
          },
          {
            name: 'max_current',
            type: 'integer',
            default: '32',
            isNullable: false,
          },
          {
            name: 'max_power',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
    );

    // Create unique constraint on (charge_point_id, connector_id)
    await queryRunner.createUniqueConstraint(
      'connectors',
      new TableUnique({
        columnNames: ['charge_point_id', 'connector_id'],
        name: 'UQ_charge_point_connector',
      }),
    );

    // Create foreign key to charge_points
    await queryRunner.createForeignKey(
      'connectors',
      new TableForeignKey({
        columnNames: ['charge_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'charge_points',
        onDelete: 'CASCADE',
        name: 'FK_connector_charge_point',
      }),
    );

    // Create index on charge_point_id
    await queryRunner.createIndex(
      'connectors',
      new TableIndex({
        name: 'IDX_connectors_charge_point_id',
        columnNames: ['charge_point_id'],
      }),
    );

    // Create index on status
    await queryRunner.createIndex(
      'connectors',
      new TableIndex({
        name: 'IDX_connectors_status',
        columnNames: ['status'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('connectors', 'IDX_connectors_status');
    await queryRunner.dropIndex('connectors', 'IDX_connectors_charge_point_id');

    // Drop foreign key
    await queryRunner.dropForeignKey('connectors', 'FK_connector_charge_point');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('connectors', 'UQ_charge_point_connector');

    // Drop table
    await queryRunner.dropTable('connectors');
  }
}
