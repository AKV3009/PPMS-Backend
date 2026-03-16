// entities/tp.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Issue } from './issue.entity';

@Entity('tps')
export class Tp {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  issueId!: number;

  @ManyToOne(() => Issue, (issue) => issue.tps, {
    onDelete: 'CASCADE',
  })
  
  @JoinColumn({ name: 'issueId' })
  issue!: Issue;

  @Column({ type: 'int' })
  tpValue!: number;

  @Column({ type: 'int' })
  layerValue!: number;
}