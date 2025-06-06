import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { Course } from './Course';

@Entity('lecturer_courses')
export class LecturerCourse {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.lecturerCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lecturer_id' })
  lecturer: User;

  @ManyToOne(() => Course, course => course.lecturerCourses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  // Method to validate lecturer-course assignment data
  static validate(data: { lecturer: User; course: Course }): boolean {
    return !!(
      data.lecturer &&
      data.course &&
      typeof data.lecturer.id === 'number' &&
      typeof data.course.id === 'number' &&
      data.lecturer.id > 0 &&
      data.course.id > 0
    );
  }

  // Method to check if assignment matches specific lecturer
  isAssignedToLecturer(lecturerId: number): boolean {
    return this.lecturer?.id === lecturerId;
  }

  // Method to check if assignment matches specific course
  isForCourse(courseId: number): boolean {
    return this.course?.id === courseId;
  }

  // Method to get assignment key for uniqueness checking
  getAssignmentKey(): string {
    return `${this.lecturer?.id}-${this.course?.id}`;
  }
}