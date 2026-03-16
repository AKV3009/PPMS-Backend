// entities/sheet-calculation.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { Sheet } from "./sheet.entity";

@Entity("sheet_calculations")
@Index(["sheetId", "tpValue"], { unique: true })

export class SheetCalculation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  sheetId!: number;

  @ManyToOne(() => Sheet, (sheet) => sheet.calculations, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "sheetId" })
  sheet!: Sheet;

  @Column({ type: "int" })
  tpValue!: number;

  // Store size values as JSON: { "26": 10, "28": 12, "30": 15 }
  @Column({ type: "jsonb" })
  sizeValues!: Record<string, number>;

  @Column({ type: "int", default: 0 })
  rowTotal!: number;
}
