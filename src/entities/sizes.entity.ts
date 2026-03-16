import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

/* ===================== size ===================== */
@Entity('sizes')
export class Size {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'size' })
  size!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
