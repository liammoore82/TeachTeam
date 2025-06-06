import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('applications')
export class Application {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @ManyToOne(() => Course, course => course.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time'],
    default: 'full-time'
  })
  availability: 'full-time' | 'part-time';

  @Column('text')
  skills: string;

  @Column('text')
  credentials: string;

  @Column('text')
  previousRoles: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'withdrawn'],
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';

  @ManyToOne(() => User, user => user.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  reviewedAt: Date;

  // Method to validate application data
  static validate(appData: Partial<Application>): boolean {
    return !!(
      appData.fullName &&
      appData.course &&
      appData.availability &&
      ['full-time', 'part-time'].includes(appData.availability) &&
      appData.skills &&
      appData.credentials &&
      appData.user
    );
  }

  // Method to update application status
  updateStatus(newStatus: Application['status']): void {
    this.status = newStatus;
    this.reviewedAt = new Date();
  }

  // Method to check if application can be edited
  canEdit(): boolean {
    return this.status === 'pending';
  }

  // Method to check if application is still active
  isActive(): boolean {
    return ['pending', 'approved'].includes(this.status);
  }

  // Method to get skills as array
  getSkillsArray(): string[] {
    return this.skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }

  // Method to set skills from array
  setSkillsFromArray(skillsArray: string[]): void {
    this.skills = skillsArray.join(', ');
  }

  // Method to get application summary for display
  getSummary(): string {
    return `Application by ${this.fullName} for ${this.course?.code || 'Course'} - Status: ${this.status}`;
  }
}