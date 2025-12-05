import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * ChargePoint Entity
 * Represents an OCPP Charge Station
 * Domain: Charging infrastructure
 *
 * CLEAN: Entity in Domain Layer (business logic isolated)
 * SOLID: Single Responsibility - represents one charge point
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
  iccid!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imsi!: string;

  @Column({ type: 'varchar', length: 50, default: 'OFFLINE' })
  status!: string;

  @Column({ type: 'integer', default: 900 })
  heartbeatInterval!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  webSocketUrl!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Business Logic: Check if charge point is healthy
   * SOLID: Single Responsibility - validates state
   */
  isHealthy(): boolean {
    return this.status === 'AVAILABLE' || this.status === 'CHARGING';
  }

  /**
   * Business Logic: Get heartbeat interval in milliseconds
   * CLEAN: Business logic encapsulated in domain entity
   */
  getHeartbeatIntervalMs(): number {
    return this.heartbeatInterval * 1000;
  }
}
