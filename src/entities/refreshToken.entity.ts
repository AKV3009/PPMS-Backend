import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./users.entity";


@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  token!: string;

  @Column()
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  user!: User;
}
