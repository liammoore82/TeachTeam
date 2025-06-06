import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
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
    default: 'student'
  })
  role: 'candidate' | 'lecturer' | 'admin';

  @OneToMany(() => Application, application => application.user)
  applications: Application[];

  @OneToMany(() => LecturerCourse, lecturerCourse => lecturerCourse.lecturer)
  lecturerCourses: LecturerCourse[];

  // Method to validate user data
  static validate(userData: Partial<User>): boolean {
    return !!(
      userData.email &&
      userData.password &&
      userData.role &&
      ['candidate', 'lecturer', 'admin'].includes(userData.role)
    );
  }

  // Method to sanitize user data (remove password for client-side)
 toSafeObject(): Pick<User, 'id' | 'email' | 'role' | 'applications' | 'lecturerCourses'> {
    return {
      id: this.id,
      email: this.email,
      role: this.role,
      applications: this.applications,
      lecturerCourses: this.lecturerCourses
    };
  }
}