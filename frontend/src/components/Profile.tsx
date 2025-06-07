import { useState, useEffect } from 'react';
import { Box, Container, Heading, Text, VStack, Badge, Divider, Avatar, useToast, Spinner, Center, Card, CardBody, CardHeader, Stat, StatLabel, StatNumber, SimpleGrid } from '@chakra-ui/react';
import { useAuth } from '../context/AccountContext';
import { userService } from '../services/userService';
import { applicationService } from '../services/applicationService';

interface UserProfile {
  id: number;
  email: string;
  role: 'candidate' | 'lecturer' | 'admin';
  createdAt: string;
}

interface ProfileStats {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
}

const Profile = () => {
  const { userEmail } = useAuth();
  const toast = useToast();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (userEmail) {
      loadUserProfile();
    }
  }, [userEmail]);

  const loadUserProfile = async (): Promise<void> => {
    try {
      setLoading(true);
      console.log('Loading profile for:', userEmail);
      const userData = await userService.getCurrentUser(userEmail!);
      console.log('User data loaded:', userData);
      setUserProfile(userData);

      if (userData.role === 'candidate') {
        console.log('Loading applications for candidate...');
        try {
          const applications = await applicationService.getApplicationsByUser(userData.id);
          console.log('Applications loaded:', applications);
          setProfileStats({
            totalApplications: applications.length,
            pendingApplications: applications.filter(app => app.status === 'pending').length,
            approvedApplications: applications.filter(app => app.status === 'approved').length
          });
        } catch (appError) {
          console.error('Error loading applications:', appError);
          setProfileStats({
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error Loading Profile',
        description: 'Failed to load user profile. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'lecturer':
        return 'purple';
      case 'candidate':
        return 'blue';
      case 'admin':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'lecturer':
        return 'Lecturer';
      case 'candidate':
        return 'Candidate';
      case 'admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center>
          <Spinner size="xl" color="set.500" />
        </Center>
      </Container>
    );
  }

  if (!userProfile) {
    return (
      <Container maxW="container.lg" py={10}>
        <Center>
          <Text color="white">Failed to load profile information.</Text>
        </Center>
      </Container>
    );
  }

  return (
    <Container maxW="container.lg" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Profile Header */}
        <Card bg="gray.900" borderColor="set.700" borderWidth="1px">
          <CardHeader>
            <Heading as="h1" size="xl" color="white" textAlign="center">
              User Profile
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={6}>
              {/* Avatar and Basic Info */}
              <VStack spacing={4}>
                <Avatar
                  size="2xl"
                  name={userProfile.email.split('@')[0]}
                  bg="set.500"
                  color="white"
                />
                <VStack spacing={2}>
                  <Heading as="h2" size="lg" color="white">
                    {userProfile.email.split('@')[0]}
                  </Heading>
                  <Text color="gray.400" fontSize="lg">
                    {userProfile.email}
                  </Text>
                  <Badge
                    colorScheme={getRoleBadgeColor(userProfile.role)}
                    fontSize="md"
                    px={3}
                    py={1}
                    borderRadius="full"
                  >
                    {getRoleDisplayName(userProfile.role)}
                  </Badge>
                </VStack>
              </VStack>
              <Divider borderColor="gray.700" />
              {/* Account Details */}
              <VStack spacing={4} width="100%">
                <Heading as="h3" size="md" color="white">
                  Account Details
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} width="100%">
                  <Box>
                    <Text color="gray.400" fontSize="sm">User ID</Text>
                    <Text color="white" fontSize="lg" fontWeight="semibold">
                      #{userProfile.id}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm">Date Joined</Text>
                    <Text color="white" fontSize="lg" fontWeight="semibold">
                      {formatDate(userProfile.createdAt)}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm">Account Type</Text>
                    <Text color="white" fontSize="lg" fontWeight="semibold">
                      {getRoleDisplayName(userProfile.role)}
                    </Text>
                  </Box>
                  <Box>
                    <Text color="gray.400" fontSize="sm">Status</Text>
                    <Badge colorScheme="green" fontSize="sm">
                      Active
                    </Badge>
                  </Box>
                </SimpleGrid>
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* Placeholder for application stats */}
        <Text color="white">Application stats go here.</Text>
        {/* Placeholder for role-specific info */}
        <Text color="white">Role-specific instructions go here.</Text>
      </VStack>
    </Container>
  );
};

export default Profile;