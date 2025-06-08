import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('blocked_users')
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userId: number;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ default: 'Your account has been blocked by an administrator.' })
  message: string;

  @CreateDateColumn()
  blockedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}