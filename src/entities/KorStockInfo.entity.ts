import { KorMarketType } from 'src/common/enum';
import { BaseEntity, Column, Entity, PrimaryColumn, Unique } from 'typeorm';

@Entity('KorStockInfo')
@Unique(['isin'])
export class KorStockInfoEntity extends BaseEntity {
  @Column({ length: 32 })
  isin: string;

  @PrimaryColumn({ length: 16 })
  code: string;

  @PrimaryColumn({ enum: KorMarketType, type: 'enum' })
  marketType: KorMarketType;

  @Column({ length: 256 })
  korName: string;

  @Column({ length: 256 })
  korNameShorten: string;

  @Column({ length: 256 })
  engName: string;

  @Column({ type: 'date' })
  listingDate: string;

  @Column({ length: 64, nullable: true, type: 'varchar' })
  securityType: string | null;

  @Column({ length: 64, nullable: true, type: 'varchar' })
  companyCategory: string | null;

  @Column({ length: 64, nullable: true, type: 'varchar' })
  stockType: string | null;

  @Column({ length: 32 })
  parValue: string; // 무액면 때문에

  // check whether these numbers fit in 2^53-1 range

  @Column({ unsigned: true, type: 'bigint' })
  shareCount: string;

  @Column({
    type: 'datetime',
  })
  updatedAt: Date;
}
