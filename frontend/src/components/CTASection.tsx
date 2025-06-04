import { Box, Container, Heading, Text, Stack, Button } from '@chakra-ui/react';
import Link from 'next/link';

const CTASection = () => {
  return (
    <Box py={20} bg="gray.900">
      <Container maxW="container.md" textAlign="center">
        <Heading
          as="h2"
          size="xl"
          mb={6}
          fontFamily="heading"
          color="white"
        >
          Ready to Get Started?
        </Heading>
        <Text fontSize="lg" mb={10} color="gray.400">
          Join our growing community of lecturers and tutors to enhance the
          educational experience at the School of Computer Science.
        </Text>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          spacing={6}
          justify="center"
        >
          <Link href="/SignUp">
            <Button
              as="span"
              size="lg"
              bg="set.500"
              color="white"
              cursor="pointer"
              _hover={{ bg: 'set.600' }}
              px={10}
              fontWeight="bold"
            >
              Create an Account
            </Button>
          </Link>
          <Link href="/SignIn">
            <Button
              as="span"
              size="lg"
              variant="outline"
              borderColor="set.400"
              color="set.300"
              cursor="pointer"
              _hover={{ bg: 'whiteAlpha.100' }}
              px={10}
            >
              Sign In
            </Button>
          </Link>
        </Stack>
      </Container>
    </Box>
  );
};

export default CTASection;