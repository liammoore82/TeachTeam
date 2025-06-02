import React from 'react';
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, Button, VStack, Box, Text, Textarea,
} from '@chakra-ui/react';
import { SelectedCandidate } from '../../types/tutor';

type EditCommentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  candidate: SelectedCandidate;
  setCandidate: (candidate: SelectedCandidate) => void;
  onSave: () => void;
  courseMap: { [key: string]: string };
};

const EditCommentModal = ({
  isOpen,
  onClose,
  candidate,
  setCandidate,
  onSave,
  courseMap,
}: EditCommentModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Edit Comments</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontWeight="bold">{candidate.name}</Text>
              <Text fontSize="sm" color="gray.400">{candidate.email}</Text>
              <Text fontSize="sm">
                Course: {candidate.course} - {courseMap[candidate.course]}
              </Text>
              <Text fontSize="sm">Rank: {candidate.rank}</Text>
            </Box>

            <Textarea
              placeholder="Add your comments about this candidate..."
              value={candidate.comments}
              onChange={(e) => setCandidate({ ...candidate, comments: e.target.value })}
              bg="gray.700"
              borderColor="set.600"
              rows={5}
            />
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button bg="set.500" color="white" _hover={{ bg: 'set.400' }} onClick={onSave}>
            Save Comment
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default EditCommentModal;