// entities/project.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Issue } from './issue.entity';
import { SheetCalculation } from './sheetCalculation.entity';
import { Dealer } from './dealers.entity';
import { SizeConfig } from './sizeConfigs.entity';

@Entity('sheets')
export class Sheet {

  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 10 })
  rollNumber!: string;

  @Column({ length: 100 })
  fabricPartyName!: string;

  @Column({ length: 10 })
  challanNumber!: string;

  @Column({ length: 10 })
  lotNumber!: string;

  @Column()
  dealerId!: number;

  @ManyToOne(() => Dealer)
  @JoinColumn({ name: 'dealerId' })
  dealer!: Dealer;

  @Column({ type: 'date' })
  cuttingDate!: Date;

  @Column({ type: 'date' })
  fabricReceivedDate!: Date;

  // --- Added Rates for Salary Calculation ---
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  frontRate!: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  backRate!: number;

  @Column({ type: 'boolean', default: false })
  hasManualEdits!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => SizeConfig, (sizeConfig) => sizeConfig.sheet, {
    cascade: true,
    eager: true,
  })
  sizeConfigs!: SizeConfig[];

  @OneToMany(() => Issue, (issue) => issue.sheet, {
    cascade: true,
    eager: true,
  })
  issues!: Issue[];

  @OneToMany(() => SheetCalculation, (calc) => calc.sheet, {
    cascade: true,
    eager: true,
  })
  calculations!: SheetCalculation[];
}
