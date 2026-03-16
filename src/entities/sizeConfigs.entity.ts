// entities/size-config.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Sheet } from './sheet.entity';
import { Size } from './sizes.entity';

@Entity('size_configs')
export class SizeConfig {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    sheetId!: number;

    @ManyToOne(() => Sheet, (sheet) => sheet.sizeConfigs, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'sheetId' })
    sheet!: Sheet;

    @Column()
    sizeId!: number;

    @ManyToOne(() => Size)
    @JoinColumn({ name: 'sizeId' })
    size!: Size;

    @Column({ type: 'int' })
    sizeValue!: number;

    @Column({ type: 'int', default: 1 })
    quantity!: number;
}