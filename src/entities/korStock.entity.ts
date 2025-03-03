import { KorMarketType } from 'src/common/enum';
import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('korStock')
export class KorStockEntity extends BaseEntity {
  @PrimaryColumn({ name: 'date', type: 'date' })
  date: string;

  @PrimaryColumn({ length: 16 })
  id: string;

  @Column({ length: 32 })
  name: string;

  @Column({ enum: KorMarketType, type: 'enum' })
  marketType: KorMarketType;

  @Column({ unsigned: true })
  openPrice: number;

  @Column({ unsigned: true })
  closePrice: number;

  @Column({ unsigned: true })
  lowPrice: number;

  @Column({ unsigned: true })
  highPrice: number;

  @Column({ unsigned: false })
  change: number;

  @Column({ unsigned: true, type: 'bigint' })
  tradingVolume: bigint;

  @Column({ unsigned: true, type: 'bigint' })
  tradingValue: bigint;

  @Column({ unsigned: true, type: 'bigint' })
  marketCap: bigint;

  @Column({ unsigned: true, type: 'bigint' })
  shareCount: bigint;

  @Column({ length: 32, nullable: true, type: 'varchar' })
  companyCategory: string | null;

  @Column({
    type: 'datetime',
  })
  updatedAt: Date;
}
