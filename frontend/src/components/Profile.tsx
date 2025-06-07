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
        <Text color="white">Profile loaded successfully!</Text>
      </VStack>
    </Container>
  );
};

export default Profile;