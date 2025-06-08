import { AppDataSource } from "../data-source";
import { Admin } from "../entity/Admin";
import { User } from "../entity/User";
import { Course } from "../entity/Course";
import { Application } from "../entity/Application";
import { LecturerCourse } from "../entity/LecturerCourse";
import { LecturerSelection } from "../entity/LecturerSelection";
import { BlockedUser } from "../entity/BlockedUser";
import bcrypt from "bcryptjs";

const adminRepository = AppDataSource.getRepository(Admin);
const userRepository = AppDataSource.getRepository(User);
const courseRepository = AppDataSource.getRepository(Course);
const applicationRepository = AppDataSource.getRepository(Application);
const lecturerCourseRepository = AppDataSource.getRepository(LecturerCourse);
const lecturerSelectionRepository = AppDataSource.getRepository(LecturerSelection);
const blockedUserRepository = AppDataSource.getRepository(BlockedUser);


export const resolvers = {
  Query: {
    me: async () => {
      return { id: 1, username: "admin", isActive: true };
    },

    users: async () => {
      return await userRepository.find({
        relations: ["applications", "lecturerCourses"]
      });
    },

    lecturers: async () => {
      const lecturers = await userRepository.find({
        where: { role: "lecturer" },
        relations: ["lecturerCourses", "lecturerCourses.course"]
      });

      // Set isActive to true for all lecturers (they're not in the blocking system)
      return lecturers.map(lecturer => ({
        ...lecturer,
        isActive: true
      }));
    },

    candidates: async () => {
      const users = await userRepository.find({
        where: { role: "candidate" },
        relations: ["applications", "applications.course"]
      });

      // Add blocked status to each user
      const usersWithBlockStatus = await Promise.all(users.map(async (user) => {
        const blockedUser = await blockedUserRepository.findOne({
          where: { userId: user.id, isActive: true }
        });
        
        return {
          ...user,
          isActive: !blockedUser, // user is active if not blocked
          blockedInfo: blockedUser || null
        };
      }));

      return usersWithBlockStatus;
    },

    courses: async () => {
      return await courseRepository.find({
        relations: ["applications", "applications.user", "lecturerCourses", "lecturerCourses.lecturer"]
      });
    },

    course: async (_: any, { id }: { id: string }) => {
      return await courseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["applications", "applications.user", "lecturerCourses", "lecturerCourses.lecturer"]
      });
    },

    lecturerCourses: async () => {
      return await lecturerCourseRepository.find({
        relations: ["lecturer", "course"]
      });
    },

    lecturerCoursesByLecturer: async (_: any, { lecturerId }: { lecturerId: string }) => {
      return await lecturerCourseRepository.find({
        where: { lecturer: { id: parseInt(lecturerId) } },
        relations: ["lecturer", "course"]
      });
    },

    applications: async () => {
      return await applicationRepository.find({
        relations: ["user", "course"]
      });
    },

    applicationsByCourse: async (_: any, { courseId }: { courseId: string }) => {
      return await applicationRepository.find({
        where: { course: { id: parseInt(courseId) } },
        relations: ["user", "course"]
      });
    },

    candidatesChosenPerCourse: async () => {
      const courses = await courseRepository.find({
        relations: ["applications"]
      });
      
      return courses.map(course => {
        const chosenCandidates = course.applications
          .filter(app => app.status === "approved")
          .map(app => app.user);
        
        return {
          course,
          chosenCandidates,
          candidateCount: chosenCandidates.length
        };
      });
    },

    candidatesWithMultipleCourses: async (_: any, { minCourses }: { minCourses?: number }) => {
      const min = minCourses || 3;
      
      const candidates = await userRepository.find({
        where: { role: "candidate" },
        relations: ["applications"]
      });

      const result = candidates
        .map(user => {
          const approvedApplications = user.applications.filter(app => app.status === "approved");
          return {
            user,
            courseCount: approvedApplications.length,
            courses: approvedApplications.map(app => app.course)
          };
        })
        .filter(item => item.courseCount >= min);

      return result;
    },

    candidatesWithNoCourses: async () => {
      const candidates = await userRepository.find({
        where: { role: "candidate" },
        relations: ["applications"]
      });

      return candidates.filter(user => 
        !user.applications.some(app => app.status === "approved")
      );
    },

    lecturerSelections: async () => {
      return await lecturerSelectionRepository.find({
        relations: ["lecturer", "application", "application.course", "application.user"]
      });
    },

    lecturerSelectionsByLecturer: async (_: any, { lecturerId }: { lecturerId: string }) => {
      return await lecturerSelectionRepository.find({
        where: { lecturer: { id: parseInt(lecturerId) } },
        relations: ["lecturer", "application", "application.course", "application.user"]
      });
    },

    lecturerSelectionsByCourse: async (_: any, { courseId }: { courseId: string }) => {
      return await lecturerSelectionRepository.find({
        where: { application: { course: { id: parseInt(courseId) } } },
        relations: ["lecturer", "application", "application.course", "application.user"]
      });
    },
  },

  Mutation: {
    login: async (_: any, { username, password }: { username: string; password: string }) => {
      const admin = await adminRepository.findOne({ where: { username } });
      
      if (!admin) {
        throw new Error("Invalid credentials");
      }

      const isValid = await bcrypt.compare(password, admin.password);
      if (!isValid) {
        throw new Error("Invalid credentials");
      }

      return { admin };
    },

    createCourse: async (_: any, { code, title, roleType }: { code: string; title: string; roleType: string }) => {
      const course = courseRepository.create({ 
        code, 
        title, 
        roleType: roleType as 'Tutor' | 'Lab Assistant' 
      });
      return await courseRepository.save(course);
    },

    updateCourse: async (_: any, { id, ...updates }: { id: string } & Partial<Course>) => {
      await courseRepository.update(id, updates);
      return await courseRepository.findOne({
        where: { id: parseInt(id) },
        relations: ["applications", "lecturerCourses"]
      });
    },

    deleteCourse: async (_: any, { id }: { id: string }) => {
      const result = await courseRepository.delete(id);
      return result.affected !== 0;
    },

    assignLecturerToCourse: async (_: any, { lecturerId, courseId }: { lecturerId: string; courseId: string }) => {
      const existing = await lecturerCourseRepository.findOne({
        where: {
          lecturer: { id: parseInt(lecturerId) },
          course: { id: parseInt(courseId) }
        }
      });

      if (existing) {
        throw new Error("Lecturer already assigned to this course");
      }

      const lecturer = await userRepository.findOne({ where: { id: parseInt(lecturerId) } });
      const course = await courseRepository.findOne({ where: { id: parseInt(courseId) } });

      if (!lecturer || !course) {
        throw new Error("Lecturer or Course not found");
      }

      const assignment = lecturerCourseRepository.create({ lecturer, course });
      return await lecturerCourseRepository.save(assignment);
    },

    unassignLecturerFromCourse: async (_: any, { lecturerId, courseId }: { lecturerId: string; courseId: string }) => {
      const result = await lecturerCourseRepository.delete({
        lecturer: { id: parseInt(lecturerId) },
        course: { id: parseInt(courseId) }
      });
      
      return result.affected !== 0;
    },

    blockUser: async (_: any, { userId, reason, message }: { userId: string; reason?: string; message?: string }) => {
      const user = await userRepository.findOne({ where: { id: parseInt(userId) } });
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is already blocked
      const existingBlock = await blockedUserRepository.findOne({
        where: { user: { id: parseInt(userId) }, isActive: true }
      });

      if (existingBlock) {
        throw new Error("User is already blocked");
      }

      // Create blocked user entry
      const blockedUser = blockedUserRepository.create({
        userId: parseInt(userId),
        user,
        reason: reason || 'Blocked by administrator',
        message: message || 'Your account has been blocked by an administrator.'
      });

      await blockedUserRepository.save(blockedUser);

      return await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["applications", "lecturerCourses"]
      });
    },

    unblockUser: async (_: any, { userId }: { userId: string }) => {
      // Find active block for user
      const blockedUser = await blockedUserRepository.findOne({
        where: { user: { id: parseInt(userId) }, isActive: true }
      });

      if (!blockedUser) {
        throw new Error("User is not currently blocked");
      }

      // Deactivate the block
      blockedUser.isActive = false;
      await blockedUserRepository.save(blockedUser);

      return await userRepository.findOne({
        where: { id: parseInt(userId) },
        relations: ["applications", "lecturerCourses"]
      });
    },
  },
};
