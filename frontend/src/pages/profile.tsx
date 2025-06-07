import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Flex, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '../context/AccountContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Profile from '../components/Profile';

const ProfilePage = () => {
  const { signedIn, userEmail, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);

  console.log('ProfilePage rendered, signedIn:', signedIn, 'userEmail:', userEmail);

  useEffect(() => {
    if (!authLoading) {
      setIsPageLoading(false);

      console.log('ProfilePage useEffect, authLoading:', authLoading, 'signedIn:', signedIn);
      if (!signedIn) {
        console.log('Not signed in, redirecting to unauthorised');
        router.push('/unauthorised');
        return;
      }
    }
  }, [authLoading, signedIn, router]);

  // Show loading spinner while checking authentication
  if (authLoading || isPageLoading) {
    return (
      <Flex direction="column" minH="100vh" bg="gray.900">
        <Center flex="1">
          <Spinner size="xl" color="set.500" />
        </Center>
      </Flex>
    );
  }

  if (!signedIn) {
    console.log('Not signed in, returning null');
    return null; // Prevent rendering while redirecting
  }

  return (
    <Flex direction="column" minH="100vh" bg="gray.900">
      <Header />

      <Box flex="1">


        <Profile />
      </Box>

      <Footer />
    </Flex>
  );
};

export default ProfilePage;