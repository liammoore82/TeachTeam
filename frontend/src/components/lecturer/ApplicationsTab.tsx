import React from 'react';
import {
  Box, Heading, SimpleGrid, Select, Input, HStack, Button, VStack,
  Text, Badge, Flex, Center,
} from '@chakra-ui/react';

import { TutorApplication, SelectedCandidate } from '../../types/tutor';

type ApplicationsTabProps = {
  filteredApplications: TutorApplication[];
  selectedCandidates: SelectedCandidate[];
  selectedCourseFilter: string;
  setSelectedCourseFilter: (value: string) => void;
  selectedRoleFilter: string; 
  setSelectedRoleFilter: (value: string) => void; 
  selectedAvailabilityFilter: string;
  setSelectedAvailabilityFilter: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  searchBy: string;
  setSearchBy: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  sortOrder: string;
  setSortOrder: (value: string) => void;
  viewApplicationDetails: (application: TutorApplication) => void;
  courseMap: { [key: string]: string };
};

// Application Card component
const ApplicationCard = ({
  app,
  selectedCandidates,
  viewApplicationDetails,
}: {
  app: TutorApplication;
  selectedCandidates: SelectedCandidate[];
  viewApplicationDetails: (application: TutorApplication) => void;
}) => (
  <Box
    p={5}
    borderWidth="1px"
    borderColor="set.700"
    borderRadius="md"
    bg="gray.800"
    _hover={{ borderColor: 'set.500' }}
    transition="all 0.2s"
  >
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      <Box>
        <Text fontWeight="bold">{app.name}</Text>
        <Text fontSize="sm" color="gray.400">{app.email}</Text>
        <Text mt={1}>
          <Badge colorScheme={app.availability === 'full-time' ? 'green' : 'blue'}>
            {app.availability === 'full-time' ? 'Full Time' : 'Part Time'}
          </Badge>
          <Badge ml={2} colorScheme="purple">{app.selectedCourse}</Badge>
          <Badge ml={2} colorScheme={app.selectedRole === 'tutor' ? 'teal' : 'orange'}>
            {app.selectedRole === 'tutor' ? 'Tutor' : 'Lab Assistant'}
          </Badge>
        </Text>
        <Text mt={2} fontSize="sm" noOfLines={2}>
          <strong>Skills:</strong> {app.skills}
        </Text>
        <Text mt={1} fontSize="sm" noOfLines={2}>
          <strong>Credentials:</strong> {app.credentials}
        </Text>
      </Box>
      <Flex justifyContent={{ base: 'flex-start', md: 'flex-end' }} alignItems="center">
        <Button
          size="sm"
          bg="set.500"
          color="white"
          _hover={{ bg: 'set.400' }}
          onClick={() => viewApplicationDetails(app)}
        >
          View Details
        </Button>

        {selectedCandidates.some((c) => c.applicationId === app.id) && (
          <Badge ml={2} colorScheme="green" variant="solid">
            Selected - Rank {selectedCandidates.find((c) => c.applicationId === app.id)?.rank}
          </Badge>
        )}
      </Flex>
    </SimpleGrid>
  </Box>
);

const ApplicationsTab = ({
  filteredApplications,
  selectedCandidates,
  selectedCourseFilter,
  setSelectedCourseFilter,
  selectedRoleFilter,
  setSelectedRoleFilter,
  selectedAvailabilityFilter,
  setSelectedAvailabilityFilter,
  searchQuery,
  setSearchQuery,
  searchBy,
  setSearchBy,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewApplicationDetails,
  courseMap,
}: ApplicationsTabProps) => {
  // Function to clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSearchBy('all');
    setSelectedCourseFilter('');
    setSelectedRoleFilter(''); 
    setSelectedAvailabilityFilter('');
    setSortBy('timestamp');
    setSortOrder('desc');
  };

  return (
    <Box
      bg="gray.900"
      p={6}
      rounded="md"
      shadow="lg"
      color="white"
      borderColor="set.700"
      borderWidth="1px"
      mb={10}
    >
      <Heading as="h2" size="lg" mb={4}>
        All Applications
      </Heading>

      {/* Search and Filter Controls */}
      <Box bg="gray.800" p={4} borderRadius="md" mb={6}>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={4} mb={4}>
          <Select
            placeholder="Filter by course"
            bg="gray.700"
            borderColor="set.700"
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
          >
            {Object.entries(courseMap).map(([code, name]) => (
              <option key={code} value={code}>
                {code} - {name}
              </option>
            ))}
          </Select>

          {/* New Role Filter */}
          <Select
            placeholder="Filter by role"
            bg="gray.700"
            borderColor="set.700"
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
          >
            <option value="tutor">Tutor</option>
            <option value="lab-assistant">Lab Assistant</option>
          </Select>

          <Select
            placeholder="Filter by availability"
            bg="gray.700"
            borderColor="set.700"
            value={selectedAvailabilityFilter}
            onChange={(e) => setSelectedAvailabilityFilter(e.target.value)}
          >
            <option value="full-time">Full Time</option>
            <option value="part-time">Part Time</option>
          </Select>

          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="gray.700"
            borderColor="set.700"
          />

          <Select
            value={searchBy}
            onChange={(e) => setSearchBy(e.target.value)}
            bg="gray.700"
            borderColor="set.700"
          >
            <option value="all">Search All Fields</option>
            <option value="name">Search by Name</option>
            <option value="email">Search by Email</option>
            <option value="course">Search by Course</option>
            <option value="role">Search by Role</option>
            <option value="availability">Search by Availability</option>
            <option value="skills">Search by Skills</option>
          </Select>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <Select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            bg="gray.700"
            borderColor="set.700"
          >
            <option value="timestamp-desc">Sort by: Newest First</option>
            <option value="timestamp-asc">Sort by: Oldest First</option>
            <option value="name-asc">Sort by: Name (A-Z)</option>
            <option value="name-desc">Sort by: Name (Z-A)</option>
            <option value="course-asc">Sort by: Course (A-Z)</option>
            <option value="course-desc">Sort by: Course (Z-A)</option>
            <option value="role-asc">Sort by: Role (A-Z)</option>
            <option value="role-desc">Sort by: Role (Z-A)</option>
          </Select>

          <HStack justifyContent="flex-end">
            <Button size="sm" onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
          </HStack>
        </SimpleGrid>
      </Box>

      {filteredApplications.length === 0 ? (
        <Center p={10}>
          <Text>No applications found for this filter.</Text>
        </Center>
      ) : (
        <VStack spacing={6} align="stretch">
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              app={app}
              selectedCandidates={selectedCandidates}
              viewApplicationDetails={viewApplicationDetails}
            />
          ))}
        </VStack>
      )}
    </Box>
  );
};

export default ApplicationsTab;