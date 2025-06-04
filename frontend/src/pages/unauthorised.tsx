import { Box, Heading, Text, Button, VStack, Link } from '@chakra-ui/react';



const Unauthorised = () => {
  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg="gray.900"
      color="white"
    >
       {/*VStack to vertically stack and center the content*/}
      <VStack spacing={6} textAlign="center">
        <Heading as="h1" size="2xl" color="set.500">
          401 - Unauthorised
        </Heading>
        <Text fontSize="lg">
          You do not have permission to access this page.
        </Text>
        // {/*button that links back to the home page*/}
        <Button
          as={Link}
          href="/"
          colorScheme="set"
          variant="solid"
          size="lg"
          _hover={{ textDecoration: 'none' }}
        >
          Go Back to Home
        </Button>
      </VStack>
    </Box>
  );
};

export default Unauthorised;
