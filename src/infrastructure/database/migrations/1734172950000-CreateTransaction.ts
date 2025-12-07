import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreateTransaction1734172950000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create transactions table
    await queryRunner.createTable(
      new Table({
        name: 'transactions',
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
            name: 'transaction_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'id_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'start_time',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'timestamp',
            isNullable: true,
          },
          {
            name: 'meter_start',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'meter_stop',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'kwh_delivered',
            type: 'numeric',
            precision: 10,
            scale: 3,
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            length: '50',
            default: "'active'",
            isNullable: false,
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

    // Create unique constraint on transaction_id
    await queryRunner.createUniqueConstraint(
      'transactions',
      new TableUnique({
        columnNames: ['transaction_id'],
        name: 'UQ_transaction_id',
      }),
    );

    // Create foreign key to charge_points
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['charge_point_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'charge_points',
        onDelete: 'CASCADE',
        name: 'FK_transaction_charge_point',
      }),
    );

    // Create index on charge_point_id
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_charge_point_id',
        columnNames: ['charge_point_id'],
      }),
    );

    // Create index on connector_id
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_connector_id',
        columnNames: ['connector_id'],
      }),
    );

    // Create index on status
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_status',
        columnNames: ['status'],
      }),
    );

    // Create index on start_time
    await queryRunner.createIndex(
      'transactions',
      new TableIndex({
        name: 'IDX_transactions_start_time',
        columnNames: ['start_time'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.dropIndex('transactions', 'IDX_transactions_start_time');
    await queryRunner.dropIndex('transactions', 'IDX_transactions_status');
    await queryRunner.dropIndex('transactions', 'IDX_transactions_connector_id');
    await queryRunner.dropIndex('transactions', 'IDX_transactions_charge_point_id');

    // Drop foreign key
    await queryRunner.dropForeignKey('transactions', 'FK_transaction_charge_point');

    // Drop unique constraint
    await queryRunner.dropUniqueConstraint('transactions', 'UQ_transaction_id');

    // Drop table
    await queryRunner.dropTable('transactions');
  }
}
