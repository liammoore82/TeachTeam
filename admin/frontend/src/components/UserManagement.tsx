import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_CANDIDATES, 
  BLOCK_USER_MUTATION, 
  UNBLOCK_USER_MUTATION 
} from '../graphql/queries';

interface Course {
  id: string;
  code: string;
  title: string;
}

interface Application {
  id: string;
  status: string;
  course: Course;
}

interface Candidate {
  id: string;
  email: string;
  isBlocked: boolean;
  applications: Application[];
}

export const UserManagement: React.FC = () => {
  const { data, loading, refetch } = useQuery(GET_CANDIDATES);

  const [blockUser] = useMutation(BLOCK_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const [unblockUser] = useMutation(UNBLOCK_USER_MUTATION, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleBlockUser = (userId: string, isCurrentlyBlocked: boolean) => {
    const action = isCurrentlyBlocked ? 'unblock' : 'block';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      if (isCurrentlyBlocked) {
        unblockUser({ variables: { userId } });
      } else {
        blockUser({ variables: { userId } });
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">User Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Block or unblock candidate login access
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved Courses
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.candidates?.map((candidate: Candidate) => {
                    const approvedApplications = candidate.applications?.filter((app: Application) => app.status === 'approved') || [];
                    
                    return (
                      <tr key={candidate.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {candidate.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            candidate.isBlocked 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800' 
                          }`}>
                            {candidate.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {candidate.applications?.length || 0} total
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {approvedApplications.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {approvedApplications.map((app: Application) => (
                                <span
                                  key={app.id}
                                  className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {app.course.code}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleBlockUser(candidate.id, candidate.isBlocked)}
                            className={`${
                              candidate.isBlocked
                                ? 'text-green-600 hover:text-green-900'
                                : 'text-red-600 hover:text-red-900'
                            }`}
                          >
                            {candidate.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};