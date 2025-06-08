import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      admin {
        id
        username
        isActive
      }
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      username
      isActive
    }
  }
`;

export const GET_COURSES = gql`
  query GetCourses {
    courses {
      id
      code
      title
      roleType
      applications {
        id
        fullName
        status
        user {
          id
          email
        }
      }
      lecturerCourses {
        id
        lecturer {
          id
          email
        }
      }
    }
  }
`;

export const GET_LECTURERS = gql`
  query GetLecturers {
    lecturers {
      id
      email
      isActive
      lecturerCourses {
        id
        course {
          id
          code
          title
        }
      }
    }
  }
`;

export const GET_CANDIDATES = gql`
  query GetCandidates {
    candidates {
      id
      email
      isActive
      applications {
        id
        status
        course {
          id
          code
          title
        }
      }
    }
  }
`;

export const CREATE_COURSE_MUTATION = gql`
  mutation CreateCourse($code: String!, $title: String!, $roleType: String!) {
    createCourse(code: $code, title: $title, roleType: $roleType) {
      id
      code
      title
      roleType
    }
  }
`;

export const UPDATE_COURSE_MUTATION = gql`
  mutation UpdateCourse($id: ID!, $code: String, $title: String, $roleType: String) {
    updateCourse(id: $id, code: $code, title: $title, roleType: $roleType) {
      id
      code
      title
      roleType
    }
  }
`;

export const DELETE_COURSE_MUTATION = gql`
  mutation DeleteCourse($id: ID!) {
    deleteCourse(id: $id)
  }
`;

export const ASSIGN_LECTURER_TO_COURSE_MUTATION = gql`
  mutation AssignLecturerToCourse($lecturerId: ID!, $courseId: ID!) {
    assignLecturerToCourse(lecturerId: $lecturerId, courseId: $courseId) {
      id
      lecturer {
        id
        email
      }
      course {
        id
        code
        title
      }
    }
  }
`;

export const UNASSIGN_LECTURER_FROM_COURSE_MUTATION = gql`
  mutation UnassignLecturerFromCourse($lecturerId: ID!, $courseId: ID!) {
    unassignLecturerFromCourse(lecturerId: $lecturerId, courseId: $courseId)
  }
`;

export const BLOCK_USER_MUTATION = gql`
  mutation BlockUser($userId: ID!) {
    blockUser(userId: $userId) {
      id
      email
      isActive
    }
  }
`;

export const UNBLOCK_USER_MUTATION = gql`
  mutation UnblockUser($userId: ID!) {
    unblockUser(userId: $userId) {
      id
      email
      isActive
    }
  }
`;

export const GET_CANDIDATES_CHOSEN_PER_COURSE = gql`
  query GetCandidatesChosenPerCourse {
    candidatesChosenPerCourse {
      course {
        id
        code
        title
        roleType
      }
      chosenCandidates {
        id
        email
      }
      candidateCount
    }
  }
`;

export const GET_CANDIDATES_WITH_MULTIPLE_COURSES = gql`
  query GetCandidatesWithMultipleCourses($minCourses: Int) {
    candidatesWithMultipleCourses(minCourses: $minCourses) {
      user {
        id
        email
      }
      courseCount
      courses {
        id
        code
        title
      }
    }
  }
`;

export const GET_CANDIDATES_WITH_NO_COURSES = gql`
  query GetCandidatesWithNoCourses {
    candidatesWithNoCourses {
      id
      email
      createdAt
    }
  }
`;

export const GET_LECTURER_SELECTIONS = gql`
  query GetLecturerSelections {
    lecturerSelections {
      id
      rank
      comments
      selectedAt
      lecturer {
        id
        email
      }
      application {
        id
        fullName
        status
        course {
          id
          code
          title
        }
        user {
          id
          email
        }
      }
    }
  }
`;

export const GET_LECTURER_SELECTIONS_BY_COURSE = gql`
  query GetLecturerSelectionsByCourse($courseId: ID!) {
    lecturerSelectionsByCourse(courseId: $courseId) {
      id
      rank
      comments
      selectedAt
      lecturer {
        id
        email
      }
      application {
        id
        fullName
        status
        course {
          id
          code
          title
        }
        user {
          id
          email
        }
      }
    }
  }
`;