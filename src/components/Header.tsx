import { Box, Flex, Heading, Button, Text } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AccountContext';

const Header = () => {
  const { signedIn, userEmail, logout } = useAuth()!;
  const router = useRouter();

  // Direct handling of logout with manual redirect
  const handleLogout = () => {
    // Call the original logout function
    logout();
    
    // Force a direct redirect to sign in page
    window.location.href = '/SignIn';
  };

  return (
    <Box as="header" bg="green.400" color="white" py={4} px={8} shadow="md">
      <Flex align="center">
        <Box flex="1" />
        <Heading as="h1" size="xl" textAlign="center" flex="1">
          <Link href="/">
              Teach Team
          </Link>
        </Heading>
        <Flex justify="flex-end" align="center" gap={4} flex="1">
          {!signedIn ? (
            <>
              <Link href="/SignIn">
                <Button colorScheme="white" variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/SignUp">
                <Button colorScheme="white" variant="outline" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Text fontSize="sm" mr={2}>
                {userEmail}
              </Text>
              <Button 
                colorScheme="white" 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;