import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Department } from "./departments.entity";

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'first_name' })
  firstName!: string;

  @Column({ name: 'last_name' })
  lastName!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'department_id', nullable: true })
  departmentId?: number;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department?: Department;

  // 🔐 Status flags
  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

}
