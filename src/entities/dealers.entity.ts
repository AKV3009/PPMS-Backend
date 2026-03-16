import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Sheet } from "./sheet.entity";

@Entity('dealer')
export class Dealer {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'dealer_name' })
  dealerName!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'created_by', nullable: true })
  createdBy?: number;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt?: Date;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy?: number;

  @Column({ name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @OneToMany(() => Sheet, sheet => sheet.dealer)
  sheets!: Sheet[];
}