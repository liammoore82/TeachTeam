import { Box, Container, Grid, Heading, Text, Flex } from '@chakra-ui/react';

const Footer = () => {
  return (
    <Box bg="gray.900" borderTop="1px solid" borderColor="gray.800" py={10}>
      <Container maxW="container.xl">
        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }}>
          <Box>
            <Heading
              as="h3"
              size="md"
              fontFamily="heading"
              mb={4}
            >
              TeachTeam
            </Heading>
            <Text color="gray.500" maxW="md">
              Assignment 1 - Daksh Nair (4062985)
			  , Liam Moore (4095280)
            </Text>
          </Box>
          
        </Grid>
      </Container>
    </Box>
  );
};

export default Footer;