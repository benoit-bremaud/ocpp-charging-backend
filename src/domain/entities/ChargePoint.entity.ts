import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ChargePoint Aggregate Root
 * Represents an OCPP 1.6 charging station entity.
 *
 * CLEAN: Domain entity - no business logic, just data + annotations.
 * SOLID: SRP - represents a ChargePoint, nothing else.
 */
@Entity('charge_points')
export class ChargePoint {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  chargePointId!: string;

  @Column({ type: 'varchar', length: 255 })
  chargePointModel!: string;

  @Column({ type: 'varchar', length: 255 })
  chargePointVendor!: string;

  @Column({ type: 'varchar', length: 50 })
  firmwareVersion!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  iccid: string | null = null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imsi: string | null = null;

  @Column({ type: 'varchar', length: 50, default: 'OFFLINE' })
  status!: string;

  @Column({ type: 'int', default: 900 })
  heartbeatInterval!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webSocketUrl: string | null = null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
