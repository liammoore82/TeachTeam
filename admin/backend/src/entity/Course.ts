import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Application } from './Application';
import { LecturerCourse } from './LecturerCourse';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({
    type: 'enum',
    enum: ['Tutor', 'Lab Assistant'],
    default: 'Tutor'
  })
  roleType: 'Tutor' | 'Lab Assistant';

  @OneToMany(() => Application, application => application.course)
  applications: Application[];

  @OneToMany(() => LecturerCourse, lecturerCourse => lecturerCourse.course)
  lecturerCourses: LecturerCourse[];

  static validate(courseData: Partial<Course>): boolean {
    return !!(
      courseData.code &&
      courseData.title &&
      courseData.roleType &&
      ['Tutor', 'Lab Assistant'].includes(courseData.roleType)
    );
  }

  getDisplayName(): string {
    return `${this.code} - ${this.title}`;
  }

  matches(searchTerm: string): boolean {
    const term = searchTerm.toLowerCase();
    return (
      this.code.toLowerCase().includes(term) ||
      this.title.toLowerCase().includes(term) ||
      this.roleType.toLowerCase().includes(term)
    );
  }
}