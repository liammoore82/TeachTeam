import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_LECTURERS, 
  GET_COURSES, 
  ASSIGN_LECTURER_TO_COURSE_MUTATION,
  UNASSIGN_LECTURER_FROM_COURSE_MUTATION 
} from '../graphql/queries';

interface Lecturer {
  id: string;
  email: string;
  isBlocked: boolean;
  lecturerCourses: LecturerCourse[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  roleType: string;
}

interface LecturerCourse {
  id: string;
  course: Course;
}

export function LecturerAssignment() {
  const [selectedLecturer, setSelectedLecturer] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  const { data: lecturersData, loading: lecturersLoading, refetch: refetchLecturers } = useQuery(GET_LECTURERS);
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_COURSES);

  const [assignLecturer] = useMutation(ASSIGN_LECTURER_TO_COURSE_MUTATION, {
    onCompleted: () => {
      setSelectedLecturer('');
      setSelectedCourse('');
      refetchLecturers();
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const [unassignLecturer] = useMutation(UNASSIGN_LECTURER_FROM_COURSE_MUTATION, {
    onCompleted: () => {
      refetchLecturers();
    }
  });

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLecturer && selectedCourse) {
      assignLecturer({
        variables: {
          lecturerId: selectedLecturer,
          courseId: selectedCourse
        }
      });
    }
  };

  const handleUnassign = (lecturerId: string, courseId: string) => {
    if (confirm('Are you sure you want to unassign this lecturer from the course?')) {
      unassignLecturer({
        variables: {
          lecturerId,
          courseId
        }
      });
    }
  };

  if (lecturersLoading || coursesLoading) return <div>Loading...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Lecturer Assignment</h1>
          <p className="mt-2 text-sm text-gray-700">
            Assign lecturers to courses for the semester
          </p>
        </div>
      </div>

      <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleAssign}>
          <div className="grid grid-cols-6 gap-6">
            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Lecturer
              </label>
              <select
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Choose a lecturer...</option>
                {lecturersData?.lecturers?.map((lecturer: Lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              >
                <option value="">Choose a course...</option>
                {coursesData?.courses?.map((course: Course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Assign Lecturer
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Current Assignments</h2>
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {lecturersData?.lecturers?.map((lecturer: Lecturer) => (
              <li key={lecturer.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {lecturer.email}
                    </p>
                    <div className="mt-2">
                      {lecturer.lecturerCourses?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {lecturer.lecturerCourses.map((assignment: LecturerCourse) => (
                            <span
                              key={assignment.id}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {assignment.course.code} - {assignment.course.title}
                              <button
                                onClick={() => handleUnassign(lecturer.id, assignment.course.id)}
                                className="ml-2 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-200"
                              >
                                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No courses assigned</p>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      !lecturer.isBlocked ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {!lecturer.isBlocked ? 'Active' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};