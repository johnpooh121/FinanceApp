import { KorMarketType } from 'src/common/enum';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('KorStock')
export class KorStockEntity extends BaseEntity {
  @PrimaryColumn({ name: 'date', type: 'date' })
  date: string;

  @PrimaryColumn({ length: 32 })
  isin: string;

  @Column({ length: 16 })
  code: string;

  @Column({ length: 32 })
  name: string;

  @Column({ enum: KorMarketType, type: 'enum' })
  marketType: KorMarketType;

  @Column({ unsigned: true })
  adjClose: number;

  @Column({ type: 'int', unsigned: true, nullable: true })
  openPrice: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  lowPrice: number | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  highPrice: number | null;

  @Column({ unsigned: false })
  change: number;

  @Column({ type: 'float' })
  changeRate: number;

  // check whether these numbers fit in 2^53-1 range

  @Column({ unsigned: true, type: 'bigint', nullable: true })
  tradingVolume: string | null;

  @Column({ unsigned: true, type: 'bigint', nullable: true })
  tradingValue: string | null;

  @Column({ unsigned: true, type: 'bigint', nullable: true })
  marketCap: string | null;

  @Column({ unsigned: true, type: 'bigint', nullable: true })
  shareCount: string | null;

  @Column({ length: 32, nullable: true, type: 'varchar' })
  companyCategory: string | null;

  @Column({ type: 'double', nullable: true })
  eps: number | null;

  @Column({ type: 'double', nullable: true })
  per: number | null;

  @Column({ type: 'double', nullable: true })
  bps: number | null;

  @Column({ type: 'double', nullable: true })
  pbr: number | null;

  @Column({ type: 'double', nullable: true })
  dps: number | null;

  @Column({ type: 'double', nullable: true })
  dy: number | null;

  @Column({
    type: 'datetime',
  })
  updatedAt: Date;
}
