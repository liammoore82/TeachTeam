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

// Updated courses data with role information
const courses: Course[] = [
  { 
    code: 'COSC1822', 
    name: 'Full Stack Development', 
    roles: ['tutor', 'lab-assistant'] 
  },
  { 
    code: 'COSC8288', 
    name: 'Programming Studio 2', 
    roles: ['tutor'] 
  },
  { 
    code: 'COSC3945', 
    name: 'Software Engineering Fundamentals', 
    roles: ['lab-assistant', 'tutor'] 
  },
  { 
    code: 'COSC5324', 
    name: 'Programming Bootcamp 2', 
    roles: ['tutor'] 
  },
];

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
    if (userRole !== 'tutor') {
      router.push('/unauthorised');
      return;
    }
    loadSavedData();
  }, [signedIn, userRole, router]);

  // Reset role when course changes
  useEffect(() => {
    setSelectedRole('');
  }, [selectedCourse]);

  // Load any previously saved application data
  const loadSavedData = (): void => {
    const storageKey = `tutorApplicationData_${userEmail || 'anonymous'}`;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData: TutorFormData = JSON.parse(savedData);
        setName(parsedData.name || '');
        setSelectedCourse(parsedData.selectedCourse || '');
        setSelectedRole(parsedData.selectedRole || ''); // Load saved role
        setAvailability(parsedData.availability || '');
        setSkills(parsedData.skills || '');
        setCredentials(parsedData.credentials || '');
        setPreviousRoles(parsedData.previousRoles || '');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  };

  // Check if candidate already applied for the same course and role combination
  const checkDuplicateApplication = (): boolean => {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('tutorApplicationData') && key !== `tutorApplicationData_${userEmail || 'anonymous'}`) {
        try {
          const applicationData = localStorage.getItem(key);
          if (applicationData) {
            const parsedApplication = JSON.parse(applicationData);
            if (parsedApplication.selectedCourse === selectedCourse && 
                parsedApplication.selectedRole === selectedRole) {
              return true; // Duplicate found
            }
          }
        } catch (error) {
          console.error('Error checking duplicate application:', error);
        }
      }
    }
    return false; // No duplicate found
  };

  // Form submission handler
  const handleSubmit = (): void => {
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
    if (checkDuplicateApplication()) {
      toast({
        title: 'Duplicate Application',
        description: `You have already applied for ${selectedRole} role in ${selectedCourse}. You cannot apply for the same role twice.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const formData: TutorFormData = {
      name,
      selectedCourse,
      selectedRole, // Include role in form data
      availability,
      skills,
      credentials,
      previousRoles,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage with role included in the key for uniqueness
    const storageKey = `tutorApplicationData_${selectedCourse}_${selectedRole}_${userEmail || 'anonymous'}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));

    // success message
    toast({
      title: 'Application Submitted',
      description: `Your application for ${selectedRole} role in ${selectedCourse} has been saved.`,
      status: 'success',
      duration: 4000,
      isClosable: true,
    });

    setFormComplete(true);
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

    if (!formComplete) {
      // Clear all application data for this user
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes(`tutorApplicationData_`) && key.includes(userEmail || 'anonymous')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      toast({
        title: 'Form Cleared',
        description: 'All fields have been cleared.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
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