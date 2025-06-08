import React from 'react';
import {
  Box, Heading, Table, Thead, Tbody, Tr, Th, Td, Text, Tag, Button,
  IconButton, HStack, VStack, Center, Badge,
} from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import { SelectedCandidate } from '../../types/tutor';

interface Course {
  id: number;
  code: string;
  title: string;
  roleType: string;
}

type SelectedCandidatesTabProps = {
  selectedCandidates: SelectedCandidate[];
  removeCandidate: (id: string) => void;
  moveRank: (id: string, direction: 'up' | 'down') => void;
  setEditingCandidate: (candidate: SelectedCandidate | null) => void;
  courseMap: { [key: string]: string };
  lecturerCourses: Course[];
};

const SelectedCandidatesTab = ({
  selectedCandidates,
  removeCandidate,
  moveRank,
  setEditingCandidate,
  courseMap,
  lecturerCourses,
}: SelectedCandidatesTabProps) => {
  // Filter candidates to only show those for lecturer's assigned courses
  const assignedCourseCodes = lecturerCourses.map(course => course.code);
  const filteredCandidates = selectedCandidates.filter(candidate => 
    assignedCourseCodes.includes(candidate.course)
  );
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
      <Heading as="h2" size="lg" mb={6}>
        Selected Candidates
      </Heading>

      {lecturerCourses.length === 0 ? (
        <Center p={10}>
          <VStack spacing={4}>
            <WarningIcon boxSize={12} color="yellow.400" />
            <Text fontSize="lg" color="gray.300" textAlign="center">
              No rankings available
            </Text>
            <Text color="gray.500" textAlign="center">
              You have not been assigned to any courses yet. Contact an administrator to get access to courses and view selected candidates.
            </Text>
          </VStack>
        </Center>
      ) : filteredCandidates.length === 0 ? (
        <Center p={10}>
          <Text>No candidates selected yet. View applications to select candidates.</Text>
        </Center>
      ) : (
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th color="gray.400">Rank</Th>
              <Th color="gray.400">Name</Th>
              <Th color="gray.400">Email</Th>
              <Th color="gray.400">Course</Th>
              <Th color="gray.400">Role</Th>
              <Th color="gray.400">Comments</Th>
              <Th color="gray.400">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCandidates
              .sort((a, b) => a.rank - b.rank)
              .map((candidate) => (
                <Tr key={candidate.applicationId}>
                  <Td>
                    <HStack>
                      <Text>{candidate.rank}</Text>
                      <VStack spacing={1}>
                        <IconButton
                          aria-label="Move up"
                          icon={<span>↑</span>}
                          size="xs"
                          isDisabled={candidate.rank === 1}
                          onClick={() => moveRank(candidate.applicationId, 'up')}
                          bg="gray.700"
                        />
                        <IconButton
                          aria-label="Move down"
                          icon={<span>↓</span>}
                          size="xs"
                          isDisabled={candidate.rank === filteredCandidates.length}
                          onClick={() => moveRank(candidate.applicationId, 'down')}
                          bg="gray.700"
                        />
                      </VStack>
                    </HStack>
                  </Td>
                  <Td fontWeight="medium">{candidate.name}</Td>
                  <Td>{candidate.email}</Td>
                  <Td>
                    <Tag colorScheme="purple">
                      {candidate.course} - {courseMap[candidate.course]}
                    </Tag>
                  </Td>
                  <Td>
                    <Badge 
                      colorScheme={candidate.role === 'tutor' ? 'teal' : 'orange'}
                      fontSize="sm"
                    >
                      {candidate.role === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                    </Badge>
                  </Td>
                  <Td>
                    <Text noOfLines={2}>{candidate.comments || 'No comments'}</Text>
                    <Button
                      size="xs"
                      variant="link"
                      colorScheme="blue"
                      mt={1}
                      onClick={() => setEditingCandidate(candidate)}
                    >
                      {candidate.comments ? 'Edit' : 'Add'} comment
                    </Button>
                  </Td>
                  <Td>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="outline"
                      onClick={() => removeCandidate(candidate.applicationId)}
                    >
                      Remove
                    </Button>
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      )}
    </Box>
  );
};

export default SelectedCandidatesTab;