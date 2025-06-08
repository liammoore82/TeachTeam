import gql from "graphql-tag";

export const typeDefs = gql`
  type Admin {
    id: ID!
    username: String!
    isActive: Boolean!
  }

  type User {
    id: ID!
    email: String!
    role: String!
    isActive: Boolean!
    createdAt: String!
    applications: [Application!]
    lecturerCourses: [LecturerCourse!]
  }

  type Course {
    id: ID!
    code: String!
    title: String!
    roleType: String!
    applications: [Application!]
    lecturerCourses: [LecturerCourse!]
  }

  type Application {
    id: ID!
    fullName: String!
    course: Course!
    availability: String!
    skills: String!
    credentials: String!
    previousRoles: String!
    status: String!
    user: User!
    submittedAt: String!
    reviewedAt: String!
  }

  type LecturerCourse {
    id: ID!
    lecturer: User!
    course: Course!
  }

  type LecturerSelection {
    id: ID!
    lecturer: User!
    application: Application!
    rank: Int!
    comments: String
    selectedAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    admin: Admin!
  }

  type CandidateReport {
    user: User!
    courseCount: Int!
    courses: [Course!]!
  }

  type CourseReport {
    course: Course!
    chosenCandidates: [User!]!
    candidateCount: Int!
  }

  type Query {
    # Authentication
    me: Admin

    # Users Management
    users: [User!]!
    lecturers: [User!]!
    candidates: [User!]!

    # Course Management
    courses: [Course!]!
    course(id: ID!): Course

    # Lecturer Course Assignments
    lecturerCourses: [LecturerCourse!]!
    lecturerCoursesByLecturer(lecturerId: ID!): [LecturerCourse!]!

    # Applications
    applications: [Application!]!
    applicationsByCourse(courseId: ID!): [Application!]!

    # Lecturer Selections
    lecturerSelections: [LecturerSelection!]!
    lecturerSelectionsByLecturer(lecturerId: ID!): [LecturerSelection!]!
    lecturerSelectionsByCourse(courseId: ID!): [LecturerSelection!]!

    # Reports
    candidatesChosenPerCourse: [CourseReport!]!
    candidatesWithMultipleCourses(minCourses: Int = 3): [CandidateReport!]!
    candidatesWithNoCourses: [User!]!
  }

  type Mutation {
    # Authentication
    login(username: String!, password: String!): AuthPayload!

    # Course Management
    createCourse(code: String!, title: String!, roleType: String!): Course!
    updateCourse(id: ID!, code: String, title: String, roleType: String): Course!
    deleteCourse(id: ID!): Boolean!

    # Lecturer Course Assignment
    assignLecturerToCourse(lecturerId: ID!, courseId: ID!): LecturerCourse!
    unassignLecturerFromCourse(lecturerId: ID!, courseId: ID!): Boolean!

    # User Management
    blockUser(userId: ID!, reason: String, message: String): User!
    unblockUser(userId: ID!): User!
  }
`;
