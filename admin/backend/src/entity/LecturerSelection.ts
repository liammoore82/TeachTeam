import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Application } from './Application';

@Entity('lecturer_selections')
export class LecturerSelection {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.lecturerCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lecturer_id' })
  lecturer: User;

  @ManyToOne(() => Application, application => application, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'application_id' })
  application: Application;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @CreateDateColumn()
  selectedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Method to validate selection data
  static validate(selectionData: Partial<LecturerSelection>): boolean {
    return !!(
      selectionData.lecturer &&
      selectionData.application &&
      selectionData.rank &&
      selectionData.rank > 0
    );
  }

  // Method to get selection summary
  getSummary(): string {
    return `Lecturer selection - Rank ${this.rank}`;
  }
}