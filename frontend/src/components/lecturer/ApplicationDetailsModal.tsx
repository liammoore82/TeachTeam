import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, VStack, Box, Text,
  Divider, Textarea, Badge,
} from '@chakra-ui/react';
import { TutorApplication } from '../../types/tutor';

type ApplicationDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  application: TutorApplication;
  comment: string;
  setComment: (comment: string) => void;
  onSelect: () => void;
  isUpdate: boolean;
  courseMap: { [key: string]: string };
};

const ApplicationDetailsModal = ({
  isOpen,
  onClose,
  application,
  comment,
  setComment,
  onSelect,
  isUpdate,
  courseMap,
}: ApplicationDetailsModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Application Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold">Applicant Name</Text>
              <Text>{application.name}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Email</Text>
              <Text>{application.email}</Text>
            </Box>

            <Divider />

            <Box>
              <Text fontWeight="bold">Course</Text>
              <Text>
                {application.selectedCourse} - {courseMap[application.selectedCourse] || 'Unknown Course'}
              </Text>
            </Box>

            <Box>
              <Text fontWeight="bold">Applied Role</Text>
              <Badge 
                colorScheme={application.selectedRole === 'tutor' ? 'teal' : 'orange'}
                fontSize="md"
                px={3}
                py={1}
              >
                {application.selectedRole === 'tutor' ? 'Tutor' : 'Lab Assistant'}
              </Badge>
            </Box>

            <Box>
              <Text fontWeight="bold">Availability</Text>
              <Text textTransform="capitalize">{application.availability}</Text>
            </Box>

            <Box>
              <Text fontWeight="bold">Skills</Text>
              <Text>{application.skills}</Text>
            </Box>

            <Box>
              <Text fontWeight="bold">Academic Credentials</Text>
              <Text>{application.credentials}</Text>
            </Box>

            {application.previousRoles && (
              <Box>
                <Text fontWeight="bold">Previous Roles</Text>
                <Text>{application.previousRoles}</Text>
              </Box>
            )}

            <Divider />

            <Box>
              <Text fontWeight="bold">Selection Comments</Text>
              <Textarea
                placeholder="Add your comments about this candidate..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                bg="gray.700"
                borderColor="set.600"
                mt={2}
              />
            </Box>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Close
          </Button>
          <Button bg="set.500" color="white" _hover={{ bg: 'set.400' }} onClick={onSelect}>
            {isUpdate ? 'Update Selection' : 'Select Candidate'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ApplicationDetailsModal;