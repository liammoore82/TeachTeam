import { Box, Link, Heading, Text, Button, SimpleGrid, Stack } from '@chakra-ui/react';
import React from 'react';
import type { NextPage } from 'next';
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import { AccountProvider } from "../context/AccountContext";
import { useAuth } from '../context/AccountContext';

const Home: NextPage = () => {
  const { userEmail, userRole } = useAuth();

  return (
    <AccountProvider>
      <Box minH="100vh" display="flex" flexDirection="column">
        <Header />
        <Sidebar />

        {/* Main Content */}
        <Box flex="1" pl={{ base: 0, md: 64 }} pr="8" 
          py={10} bg="gray.900" color="white">
          {!userEmail ? (
            <Text textAlign="center" mt={10} fontSize="xl">
              Please <Link href="/SignIn" color="set.300">sign in</Link> to view the dashboard options.
            </Text>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing="10">
              {/* Lecturer Section */}
              {userRole === 'lecturer' && (
                <Stack spacing={4} align="center" textAlign="center">
                  <Heading size="lg" fontFamily="heading">Lecturers</Heading>
                  <Text>If you're signed in as a lecturer, you can view and manage tutor applications below:</Text>
                  <Link href="/lecturer">
                    <Button bg="set.500" _hover={{ bg: "set.400" }} color="white">
                      Go to Lecturer Dashboard
                    </Button>
                  </Link>
                </Stack>
              )}

              {/* Tutor Section */}
              {userRole === 'tutor' && (
                <Stack spacing="4" align="center" textAlign="center">
                  <Heading size="lg" fontFamily="heading">Tutors</Heading>
                  <Text>If you're signed in as a tutor, you can create and submit an application below:</Text>
                  <Link href="/tutor">
                    <Button bg="set.500" _hover={{ bg: "set.400" }} color="white">
                      Go to Tutor Dashboard
                    </Button>
                  </Link>
                </Stack>
              )}
            </SimpleGrid>
          )}
        </Box>

        <Footer />
      </Box>
    </AccountProvider>
  );
};

export default Home;