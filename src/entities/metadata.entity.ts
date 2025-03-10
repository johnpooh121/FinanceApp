import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('metadata')
export class MetadataEntity extends BaseEntity {
  @PrimaryColumn({ length: 64 })
  key: string;

  @Column({ length: 2048 })
  value: string;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
