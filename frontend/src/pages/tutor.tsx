import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Heading,
  Center,
  Box,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  Button,
  VStack,
  useToast,
  HStack,
  Input,
} from '@chakra-ui/react';
import { useAuth } from '../context/AccountContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { applicationService } from '../services/applicationService';
import { courseService } from '../services/courseService';
import { userService } from '../services/userService';


type Course = {
  code: string;
  name: string;
  roles: string[]; // Array of available roles for this course
};

type TutorFormData = {
  name: string;
  selectedCourse: string;
  selectedRole: string; // New field for role selection
  availability: string;
  skills: string;
  credentials: string;
  previousRoles: string;
  timestamp?: string;
};


const TutorDashboard = () => {
  const { signedIn, userRole, userEmail } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [name, setName] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>(''); // New state for role
  const [availability, setAvailability] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [credentials, setCredentials] = useState<string>('');
  const [previousRoles, setPreviousRoles] = useState<string>('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [formComplete, setFormComplete] = useState<boolean>(false);

  // Get available roles for selected course
  const getAvailableRoles = (): string[] => {
    const course = courses.find(c => c.code === selectedCourse);
    return course ? course.roles : [];
  };

  // Authentication and data loading effect
  useEffect(() => {
    if (!signedIn) {
      router.push('/unauthorised');
      return;
    }
    if (userRole !== 'candidate') {
      router.push('/unauthorised');
      return;
    }
    loadUserDataFromAPI();
  }, [signedIn, userRole, router]);

  // Reset role when course changes
  useEffect(() => {
    setSelectedRole('');
  }, [selectedCourse]);

  // Load user data and courses from API
  const loadUserDataFromAPI = async (): Promise<void> => {
    try {
      setIsLoading(true);

      // Load courses and current user concurrently
      const [coursesData, userData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getCurrentUser(userEmail!)
      ]);

      setCourses(coursesData.map(course => ({
        code: course.code,
        name: course.title,
        roles: course.roleType === 'Tutor' ? ['tutor'] : ['lab-assistant']
      })));

      setCurrentUser(userData);

      // Load any existing applications for this user
      const userApplications = await applicationService.getApplicationsByUser(userData.id);
      
      // If user has a pending application, populate the form
      if (userApplications.length > 0) {
        const latestApp = userApplications[0]; // Get most recent application
        setName(latestApp.name || '');
        setSelectedCourse(latestApp.selectedCourse || '');
        setSelectedRole(latestApp.selectedRole || '');
        setAvailability(latestApp.availability || '');
        setSkills(latestApp.skills || '');
        setCredentials(latestApp.credentials || '');
        setPreviousRoles(latestApp.previousRoles || '');
      }

    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load user data. Please refresh the page.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if candidate already applied for the same course and role combination
  const checkDuplicateApplication = async (): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const userApplications = await applicationService.getApplicationsByUser(currentUser.id);
      
      // Check if user already has an application for this course/role combination
      const duplicate = userApplications.find(app => 
        app.selectedCourse === selectedCourse && 
        app.selectedRole === selectedRole
      );

      return !!duplicate;
    } catch (error) {
      console.error('Error checking duplicate application:', error);
      return false;
    }
  };

  // Form submission handler
  const handleSubmit = async (): Promise<void> => {
    // Validate required fields
    if (!name) {
      toast({
        title: 'Name Required',
        description: 'Please enter your full name.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!selectedCourse) {
      toast({
        title: 'Invalid Course',
        description: 'Please select a valid course.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!selectedRole) {
      toast({
        title: 'Role Required',
        description: 'Please select a role (Tutor or Lab Assistant).',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    if (!availability || !skills || !credentials) {
      toast({
        title: 'Incomplete Form',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // Check for duplicate application
    const isDuplicate = await checkDuplicateApplication();
    if (isDuplicate) {
      toast({
        title: 'Duplicate Application',
        description: `You have already applied for ${selectedRole} role in ${selectedCourse}. You cannot apply for the same role twice.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);

      // Find the course ID from the database
      const allCourses = await courseService.getAllCourses();
      const course = allCourses.find(c => c.code === selectedCourse);
      
      if (!course || !currentUser) {
        throw new Error('Course or user not found');
      }

      // Submit application to API
      await applicationService.createApplication({
        fullName: name,
        courseId: course.id,
        availability: availability as 'full-time' | 'part-time',
        skills,
        credentials,
        previousRoles,
        userId: currentUser.id
      });

      // Success message
      toast({
        title: 'Application Submitted',
        description: `Your application for ${selectedRole} role in ${selectedCourse} has been submitted successfully.`,
        status: 'success',
        duration: 4000,
        isClosable: true,
      });

      setFormComplete(true);

    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Submission Failed',
        description: error.response?.data?.error || 'Failed to submit application. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear form fields
  const clearFormFields = (): void => {
    setName('');
    setSelectedCourse('');
    setSelectedRole('');
    setAvailability('');
    setSkills('');
    setCredentials('');
    setPreviousRoles('');

    toast({
      title: 'Form Cleared',
      description: 'All fields have been cleared.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });

    setFormComplete(false);
  };

  return (
    <>
      <Header />

      <Container maxW="container.md" py={10}>
        <Center mb={10}>
          <Heading as="h1" size="xl" fontFamily="heading" color="white">
            Candidate Dashboard
          </Heading>
        </Center>
        <Box
          bg="gray.900"
          p={6}
          rounded="md"
          shadow="lg"
          color="white"
          borderColor="set.700"
          borderWidth="1px"
        >
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Full Name</FormLabel>
              <Input
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Apply for a Course</FormLabel>
              <Select
                placeholder="Select a course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              >
                {courses.map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Apply for Role</FormLabel>
              <Select
                placeholder="Select a role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
                isDisabled={!selectedCourse}
              >
                {getAvailableRoles().map((role) => (
                  <option key={role} value={role}>
                    {role === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                  </option>
                ))}
              </Select>
              {!selectedCourse && (
                <Box mt={1} fontSize="sm" color="gray.400">
                  Select a course first to see available roles
                </Box>
              )}
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Availability</FormLabel>
              <Select
                placeholder="Select availability"
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              >
                <option value="part-time">Part Time</option>
                <option value="full-time">Full Time</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Skills</FormLabel>
              <Textarea
                placeholder="List your skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Academic Credentials</FormLabel>
              <Textarea
                placeholder="List your academic qualifications"
                value={credentials}
                onChange={(e) => setCredentials(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Previous Roles (if any)</FormLabel>
              <Textarea
                placeholder="List any past tutor/lab roles"
                value={previousRoles}
                onChange={(e) => setPreviousRoles(e.target.value)}
                bg="gray.800"
                borderColor="set.700"
                _hover={{ borderColor: "set.600" }}
                _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
              />
            </FormControl>

            <HStack spacing={4} justifyContent="flex-end" pt={4}>
              <Button
                variant="outline"
                borderColor="set.500"
                color="white"
                _hover={{ bg: "gray.700" }}
                onClick={clearFormFields}
              >
                Clear All Fields
              </Button>
              <Button
                bg="set.500"
                color="white"
                _hover={{ bg: "set.400" }}
                onClick={handleSubmit}
              >
                Submit Application
              </Button>
            </HStack>
          </VStack>
        </Box>
      </Container>

      <Footer />
    </>
  );
};

export default TutorDashboard;