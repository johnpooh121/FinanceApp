import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserEntity extends BaseEntity {
  @PrimaryColumn({ length: 128 })
  id: string;

  @Column({ length: 128, nullable: true, type: 'varchar' })
  email: string | null;

  @Column({ type: 'int' })
  quota: number;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastLogin: Date;

  @Column({
    type: 'tinyint',
    default: false,
  })
  sub: boolean;

  @Column({
    type: 'json',
    nullable: true,
  })
  criteria: object;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
