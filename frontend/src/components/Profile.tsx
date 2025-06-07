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

      // Load user profile
      const userData = await userService.getCurrentUser(userEmail!);
      console.log('User data loaded:', userData);
      setUserProfile(userData);

      // Load profile statistics if user is a candidate
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
          // Continue without stats if applications fail to load
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

        {/* Application Statistics (for candidates only) */}
        {userProfile.role === 'candidate' && profileStats && (
          <Card bg="gray.900" borderColor="set.700" borderWidth="1px">
            <CardHeader>
              <Heading as="h3" size="lg" color="white">
                Application Statistics
              </Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
                <Stat>
                  <StatLabel color="gray.400">Total Applications</StatLabel>
                  <StatNumber color="white" fontSize="3xl">
                    {profileStats.totalApplications}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel color="gray.400">Pending Review</StatLabel>
                  <StatNumber color="orange.400" fontSize="3xl">
                    {profileStats.pendingApplications}
                  </StatNumber>
                </Stat>

                <Stat>
                  <StatLabel color="gray.400">Approved</StatLabel>
                  <StatNumber color="green.400" fontSize="3xl">
                    {profileStats.approvedApplications}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>
        )}

        {/* Role-specific Information */}
        <Card bg="gray.900" borderColor="set.700" borderWidth="1px">
          <CardHeader>
            <Heading as="h3" size="lg" color="white">
              Role Information
            </Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="start">
              {userProfile.role === 'candidate' && (
                <>
                  <Text color="white">
                    As a <strong>Candidate</strong>, you can:
                  </Text>
                  <VStack spacing={2} align="start" pl={4}>
                    <Text color="gray.300">• Apply for tutor and lab assistant positions</Text>
                    <Text color="gray.300">• Track your application status</Text>
                    <Text color="gray.300">• Update your application details</Text>
                    <Text color="gray.300">• View available courses and roles</Text>
                  </VStack>
                </>
              )}

              {userProfile.role === 'lecturer' && (
                <>
                  <Text color="white">
                    As a <strong>Lecturer</strong>, you can:
                  </Text>
                  <VStack spacing={2} align="start" pl={4}>
                    <Text color="gray.300">• Review candidate applications</Text>
                    <Text color="gray.300">• Select and rank candidates</Text>
                    <Text color="gray.300">• Add comments to applications</Text>
                    <Text color="gray.300">• View application statistics</Text>
                  </VStack>
                </>
              )}

              {userProfile.role === 'admin' && (
                <>
                  <Text color="white">
                    As an <strong>Administrator</strong>, you can:
                  </Text>
                  <VStack spacing={2} align="start" pl={4}>
                    <Text color="gray.300">• Manage all users and applications</Text>
                    <Text color="gray.300">• Create and manage courses</Text>
                    <Text color="gray.300">• Assign lecturers to courses</Text>
                    <Text color="gray.300">• View system-wide statistics</Text>
                  </VStack>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Profile;