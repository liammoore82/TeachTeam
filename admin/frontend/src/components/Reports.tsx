import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
  GET_CANDIDATES_CHOSEN_PER_COURSE,
  GET_CANDIDATES_WITH_MULTIPLE_COURSES,
  GET_CANDIDATES_WITH_NO_COURSES
} from '../graphql/queries';

export const Reports: React.FC = () => {
  const [activeReport, setActiveReport] = useState('chosen-per-course');
  const [minCourses, setMinCourses] = useState(3);

  const { data: chosenPerCourseData, loading: chosenPerCourseLoading } = useQuery(
    GET_CANDIDATES_CHOSEN_PER_COURSE
  );

  const { data: multipleCourseData, loading: multipleCourseLoading } = useQuery(
    GET_CANDIDATES_WITH_MULTIPLE_COURSES,
    { variables: { minCourses } }
  );

  const { data: noCourseData, loading: noCourseLoading } = useQuery(
    GET_CANDIDATES_WITH_NO_COURSES
  );


  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Reports</h1>
          <p className="mt-2 text-sm text-gray-700">
            Generate reports on candidate selections and course assignments
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveReport('chosen-per-course')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'chosen-per-course'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Chosen Per Course
            </button>
            <button
              onClick={() => setActiveReport('multiple-courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'multiple-courses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Multiple Courses
            </button>
            <button
              onClick={() => setActiveReport('no-courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeReport === 'no-courses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              No Courses
            </button>
          </nav>
        </div>
      </div>

      <div className="mt-8">
        {activeReport === 'chosen-per-course' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Candidates Chosen for Each Course
            </h2>
            {chosenPerCourseLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {chosenPerCourseData?.candidatesChosenPerCourse?.map((courseReport: any) => (
                    <li key={courseReport.course.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {courseReport.course.code} - {courseReport.course.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {courseReport.candidateCount} candidates chosen
                          </p>
                          <div className="mt-2">
                            {courseReport.chosenCandidates.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {courseReport.chosenCandidates.map((candidate: any) => (
                                  <span
                                    key={candidate.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                  >
                                    {candidate.email}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-400">No candidates chosen</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeReport === 'multiple-courses' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">
                Candidates with Multiple Courses
              </h2>
              <div className="flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-lg border">
                <label className="text-sm font-medium text-gray-700">Minimum courses:</label>
                <select
                  value={minCourses}
                  onChange={(e) => setMinCourses(parseInt(e.target.value))}
                  className="w-20 border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium bg-white"
                >
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                </select>
              </div>
            </div>
            {multipleCourseLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {multipleCourseData?.candidatesWithMultipleCourses?.map((candidateReport: any) => (
                    <li key={candidateReport.user.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {candidateReport.user.email}
                          </p>
                          <p className="text-sm text-gray-500">
                            {candidateReport.courseCount} courses
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {candidateReport.courses.map((course: any) => (
                              <span
                                key={course.id}
                                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {course.code} - {course.title}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {!multipleCourseData?.candidatesWithMultipleCourses?.length && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    No candidates found with {minCourses} or more courses
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeReport === 'no-courses' && (
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Unselected Candidates
            </h2>
            {noCourseLoading ? (
              <div>Loading...</div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {noCourseData?.candidatesWithNoCourses?.map((candidate: any) => (
                    <li key={candidate.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {candidate.email}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            No courses
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                {!noCourseData?.candidatesWithNoCourses?.length && (
                  <div className="px-6 py-4 text-center text-gray-500">
                    All candidates have at least one approved course
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};