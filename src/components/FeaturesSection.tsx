import { Box, Container, Heading, SimpleGrid, VStack, Text, Icon } from '@chakra-ui/react';
import {
  FaChalkboardTeacher,
  FaClipboardList,
  FaUserGraduate,
  FaComments,
  FaSearch,
  FaCalendarAlt,
} from 'react-icons/fa';
import { IconType } from 'react-icons';

interface FeatureItemProps {
  icon: IconType;
  title: string;
  description: string;
}

const FeatureItem = ({ icon, title, description }: FeatureItemProps) => {
  return (
    <VStack
      align="start"
      p={6}
      bg="gray.800"
      rounded="lg"
      _hover={{
        transform: 'translateY(-5px)',
        transition: 'transform 0.3s ease',
        boxShadow: 'lg',
      }}
      borderLeft="4px solid"
      borderColor="set.500"
    >
      <Icon as={icon} w={10} h={10} color="set.400" mb={2} />
      <Text fontWeight="bold" fontSize="xl">
        {title}
      </Text>
      <Text color="gray.400">{description}</Text>
    </VStack>
  );
};

interface FeaturesSectionProps {
  features: FeatureItemProps[];
}

const FeaturesSection = ({ features }: FeaturesSectionProps) => {
  return (
    <Box py={16} bg="gray.900">
      <Container maxW="container.xl">
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          mb={12}
          fontFamily="heading"
          color="white"
        >
          Key Features
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          {features.map((feature, index) => (
            <FeatureItem key={index} {...feature} />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

const defaultFeatures: FeatureItemProps[] = [
  {
    icon: FaChalkboardTeacher,
    title: 'Efficient Tutor Selection',
    description:
      'Browse through qualified candidates and select the right tutors for your courses.',
  },
  {
    icon: FaClipboardList,
    title: 'Detailed Applications',
    description:
      'Tutor applicants can showcase their qualifications, experience, and teaching preferences.',
  },
  {
    icon: FaComments,
    title: 'Feedback System',
    description: 'Lecturers can leave comments and feedback on applicant profiles.',
  },
  {
    icon: FaSearch,
    title: 'Advanced Filtering',
    description:
      'Find the perfect candidates using powerful search and filtering capabilities.',
  },
  {
    icon: FaUserGraduate,
    title: 'Academic Tracking',
    description: "Track applicants' academic history and course-specific expertise.",
  },
  {
    icon: FaCalendarAlt,
    title: 'Scheduling Tools',
    description: 'Simplify the scheduling process for tutorials and labs.',
  },
];

export default () => <FeaturesSection features={defaultFeatures} />;