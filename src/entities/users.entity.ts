import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { RefreshToken } from "./refreshToken.entity";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.ADMIN })
  role!: UserRole;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToMany(() => RefreshToken, (rt) => rt.user)
  refreshTokens!: RefreshToken[];
}
