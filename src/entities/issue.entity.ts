// entities/issue.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Tp } from './tp.entity';
import { Sheet } from './sheet.entity';
import { Employee } from './employee.entity';

@Entity('issues')
export class Issue {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sheetId!: number;

  // FIXED: Changed '(project) => project.issues' to '(sheet) => sheet.issues'
  @ManyToOne(() => Sheet, (sheet) => sheet.issues, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sheetId' })
  sheet!: Sheet;

  @Column({ length: 50 })
  issueCode!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  mtr!: number;

  @Column({ type: 'int', default: 0 })
  displayOrder!: number;

  @Column({ nullable: true })
  frontEmployeeId!: number | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'frontEmployeeId' })
  frontEmployee!: Employee | null;

  @Column({ nullable: true })
  backEmployeeId!: number | null;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'backEmployeeId' })
  backEmployee!: Employee | null;

  @OneToMany(() => Tp, (tp) => tp.issue, {
    cascade: true,
    eager: true,
  })
  tps!: Tp[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;
}