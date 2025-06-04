import { Box, Flex, Heading, Button, Text, Container, HStack } from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AccountContext';

const Header = () => {
  const { signedIn, userEmail, logout } = useAuth()!;
  const router = useRouter();
  
  // Direct handling of logout with manual redirect
  const handleLogout = () => {
    
    logout();
    
    // Force a redirect to sign in page
    window.location.href = '/SignIn';
  };

  
 

  return (
    <Box 
      as="header" 
      bg="gray.900" 
      color="white" 
      py={4} 
      borderBottom="1px solid" 
      borderColor="gray.800"
      shadow="md" 
      zIndex="2"
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Box 
            onClick={() => router.push('/')} 
            cursor="pointer"
          >
            <Heading 
              as="h1" 
              size="xl" 
              fontFamily="heading"
              bgGradient="linear(to-r, white, set.300)"
              bgClip="text"
            >
              TeachTeam
            </Heading>
          </Box>
          
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <Text 
              color="gray.300" 
              _hover={{ color: 'set.300' }} 
              cursor="pointer"
              onClick={() => router.push('/')}
            >
              About
            </Text>
            <Text 
              color="gray.300" 
              _hover={{ color: 'set.300' }} 
              cursor="pointer"
              onClick={() => router.push('/')}
            >
              Features
            </Text>
            <Text 
              color="gray.300" 
              _hover={{ color: 'set.300' }} 
              cursor="pointer"
              onClick={() => router.push('/')}
            >
              Contact
            </Text>
          </HStack>
          
          {!signedIn ? (
            <HStack spacing={4}>
              <Button 
                variant="ghost" 
                color="gray.300" 
                _hover={{ bg: 'whiteAlpha.100', color: 'set.300' }}
                size="sm"
                onClick={() => router.push('/SignIn')}
              >
                Sign In
              </Button>
              <Button 
                bg="set.500" 
                color="white" 
                _hover={{ bg: 'set.600' }}
                size="sm"
                onClick={() => router.push('/SignUp')}
              >
                Sign Up
              </Button>
            </HStack>
          ) : (
            <HStack spacing={4}>
              <Text fontSize="sm" color="set.200">
                {userEmail}
              </Text>
              <Button 
                variant="outline" 
                borderColor="set.400"
                color="set.300"
                _hover={{ bg: 'whiteAlpha.100' }}
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          )}
        </Flex>
      </Container>
    </Box>
  );
};

export default Header;