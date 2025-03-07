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

  @Column({ unsigned: true })
  openPrice: number;

  @Column({ unsigned: true })
  lowPrice: number;

  @Column({ unsigned: true })
  highPrice: number;

  @Column({ unsigned: false })
  change: number;

  @Column({ type: 'float' })
  changeRate: number;

  // check whether these numbers fit in 2^53-1 range

  @Column({ unsigned: true, type: 'bigint' })
  tradingVolume: string;

  @Column({ unsigned: true, type: 'bigint' })
  tradingValue: string;

  @Column({ unsigned: true, type: 'bigint' })
  marketCap: string;

  @Column({ unsigned: true, type: 'bigint' })
  shareCount: string;

  @Column({ length: 32, nullable: true, type: 'varchar' })
  companyCategory: string | null;

  @Column({
    type: 'datetime',
  })
  updatedAt: Date;
}
