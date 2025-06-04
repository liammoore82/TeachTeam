import { Grid, Box, Heading, Text, HStack, Button, Flex, Container, Stack } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';

interface AudienceActionProps {
  label: string;
  primary: boolean;
  href?: string;
}

interface AudienceGroupProps {
  title: string;
  description: string;
  imageSrc: string;
  actions: AudienceActionProps[];
  isReversed: boolean;
}

const AudienceGroup = ({
  title,
  description,
  imageSrc,
  actions,
  isReversed,
}: AudienceGroupProps) => {
  return (
    <Grid
      templateColumns={{ base: '1fr', md: isReversed ? '1fr 1fr' : '1fr 1fr' }}
      gap={10}
      alignItems="center"
    >
      <Box order={{ base: 1, md: isReversed ? 2 : 1 }}>
        <Heading as="h3" size="lg" mb={4} color="white">
          {title}
        </Heading>
        <Text color="gray.400" mb={6}>
          {description}
        </Text>
        <HStack spacing={4}>
          {actions.map((action, index) => (
            <Link key={index} href={action.href || '#'}>
              <Button
                as="span"
                size="md"
                variant={action.primary ? 'solid' : 'outline'}
                bg={action.primary ? 'set.500' : 'transparent'}
                color={action.primary ? 'white' : 'set.300'}
                borderColor={action.primary ? '' : 'set.500'}
                cursor="pointer"
                _hover={{ bg: action.primary ? 'set.600' : 'whiteAlpha.100' }}
              >
                {action.label}
              </Button>
            </Link>
          ))}
        </HStack>
      </Box>
      <Flex justify="center" order={{ base: 2, md: isReversed ? 1 : 2 }}>
        <Box
          width="100%"
          height="320px"
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.700"
        >
          <Image
            src={imageSrc}
            alt={`${title} interface`}
            objectFit="cover"
            layout="fill"
          />
        </Box>
      </Flex>
    </Grid>
  );
};

interface AudienceOverviewProps {
  audiences: AudienceGroupProps[];
}

const AudienceOverview = ({ audiences }: AudienceOverviewProps) => {
  return (
    <Box py={16} bg="gray.850">
      <Container maxW="container.xl">
        <Heading
          as="h2"
          size="xl"
          textAlign="center"
          mb={16}
          fontFamily="heading"
          color="white"
        >
          Designed For
        </Heading>

        <Stack spacing={24}>
          {audiences.map((audience, index) => (
            <AudienceGroup key={index} {...audience} />
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

const defaultAudiences: AudienceGroupProps[] = [
  {
    title: "Lecturers",
    description: "Review applicants, leave feedback, and select the most qualified tutors for your courses. View in-depth candidate statistics and information.",
    imageSrc: "/lecturer.jpg",
    actions: [
      { label: "Review Applications", primary: true, href: "/lecturer" },
      { label: "Learn More", primary: false, href: "/" },
    ],
    isReversed: false,
  },
  {
    title: "Tutor Applicants",
    description: "Showcase your qualifications, preferred courses, and teaching experience. Apply for multiple positions and track your application status in real-time.",
    imageSrc: "/tutor.jpg",
    actions: [
      { label: "Apply Now", primary: true, href: "/SignUp" },
      { label: "View Requirements", primary: false, href: "/" },
    ],
    isReversed: true,
  },
];

export default () => <AudienceOverview audiences={defaultAudiences} />;