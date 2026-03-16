import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'department_name' })
  departmentName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}