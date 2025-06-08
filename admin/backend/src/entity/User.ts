import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: ['candidate', 'lecturer', 'admin'],
    default: 'candidate'
  })
  role: 'candidate' | 'lecturer' | 'admin';

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  @OneToMany(() => LecturerCourse, lecturerCourse => lecturerCourse.lecturer)
  lecturerCourses: LecturerCourse[];

  @CreateDateColumn()
  createdAt: Date;

  static validate(userData: Partial<User>): boolean {
    return !!(
      userData.email &&
      userData.password &&
      userData.role &&
      ['candidate', 'lecturer', 'admin'].includes(userData.role)
    );
  }

  toSafeObject(): Pick<User, 'id' | 'email' | 'role' | 'applications' | 'lecturerCourses' | 'createdAt' | 'isActive'> {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      applications: this.applications,
      lecturerCourses: this.lecturerCourses,
      createdAt: this.createdAt,
      isActive: this.isActive
    };
  }
}