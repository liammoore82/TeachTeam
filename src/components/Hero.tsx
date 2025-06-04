import { Box, Button, Container, Grid, Heading, Stack, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';

interface HeroProps {}

const Hero = ({}: HeroProps) => {
  const tagline = "Unlock Exceptional Tutors";

  return (
    <Box position="relative" overflow="hidden" bg="transparent">
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        zIndex={0}
        style={{ filter: 'blur(5px)' }}
      >
        <Image
          src="/placeholder.jpg"
          alt="Computer science students collaborating"
          layout="fill"
          objectFit="cover"
        />
      </Box>

      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-r, rgba(40, 40, 40, 0.7), rgba(28, 69, 50, 0.6))"
        zIndex={1}
      />

      <Container maxW="container.xl" position="relative" zIndex={2} py={20}>
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={10} alignItems="center">
          <Box>
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              mb={4}
              bgGradient="linear(to-r, white, set.300)"
              bgClip="text"
              fontFamily="heading"
            >
              {tagline}
            </Heading>
            <Text fontSize="xl" fontWeight="medium" mb={6} color="white">
              Streamline the process of selecting and hiring exceptional tutors
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              <Link href="/SignUp">
                <Button
                  as="span"
                  size="lg"
                  bg="set.500"
                  color="white"
                  cursor="pointer"
                  _hover={{ bg: 'set.600' }}
                  fontWeight="bold"
                >
                  Apply as Tutor
                </Button>
              </Link>
              <Link href="/SignUp">
                <Button
                  as="span"
                  size="lg"
                  bg="set.500"
                  color="white"
                  cursor="pointer"
                  _hover={{ bg: 'set.600' }}
                  fontWeight="bold"
                >
                  Join as Lecturer
                </Button>
              </Link>
            </Stack>
          </Box>
          <Box display={{ base: 'none', md: 'block' }} />
        </Grid>
      </Container>
    </Box>
  );
};

export default Hero;