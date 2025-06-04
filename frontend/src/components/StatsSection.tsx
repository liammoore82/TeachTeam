import { Box, Container, SimpleGrid, VStack, Text } from '@chakra-ui/react';

interface StatProps {
  label: string;
  value: string;
}

const StatsSection = () => {
  const stats: StatProps[] = [
    { label: 'Courses Supported', value: '120+' },
    { label: 'Active Tutors', value: '300+' },
    { label: 'Successful Placements', value: '1,200+' },
    { label: 'Student Satisfaction', value: '96%' },
  ];

  return (
    <Box py={16} bgGradient="linear(to-r, gray.900, gray.800)">
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
          {stats.map((stat, index) => (
            <VStack key={index} spacing={2} align="center">
              <Text
                fontSize="5xl"
                fontWeight="bold"
                color="set.400"
              >
                {stat.value}
              </Text>
              <Text color="gray.300" fontSize="lg">
                {stat.label}
              </Text>
            </VStack>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default StatsSection;