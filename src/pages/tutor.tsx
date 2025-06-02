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
};


type TutorFormData = {
  name: string;
  selectedCourse: string;
  availability: string;
  skills: string;
  credentials: string;
  previousRoles: string;
  timestamp?: string;
};

// Courses data
const courses: Course[] = [
  { code: 'COSC1822', name: 'Full Stack Development - Tutor' },
  { code: 'COSC8288', name: 'Programming Studio 2 - Tutor' },
  { code: 'COSC3945', name: 'Software Engineering Fundamentals - Lab Assistant' },
  { code: 'COSC5324', name: 'Programming Bootcamp 2 - Tutor' },
];

const TutorDashboard = () => {
  const { signedIn, userRole, userEmail } = useAuth();
  const router = useRouter();
  const toast = useToast();

  
  const [name, setName] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [availability, setAvailability] = useState<string>('');
  const [skills, setSkills] = useState<string>('');
  const [credentials, setCredentials] = useState<string>('');
  const [previousRoles, setPreviousRoles] = useState<string>('');

  
  const [formComplete, setFormComplete] = useState<boolean>(false);

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

  // Load any previously saved application data
  const loadSavedData = (): void => {
    const storageKey = `tutorApplicationData_${userEmail || 'anonymous'}`;

    try {
      const savedData = localStorage.getItem(storageKey);
      if (savedData) {
        const parsedData: TutorFormData = JSON.parse(savedData);
        setName(parsedData.name || '');
        setSelectedCourse(parsedData.selectedCourse || '');
        setAvailability(parsedData.availability || '');
        setSkills(parsedData.skills || '');
        setCredentials(parsedData.credentials || '');
        setPreviousRoles(parsedData.previousRoles || '');
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
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

    
    const formData: TutorFormData = {
      name,
      selectedCourse,
      availability,
      skills,
      credentials,
      previousRoles,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    const storageKey = `tutorApplicationData_${userEmail || 'anonymous'}`;
    localStorage.setItem(storageKey, JSON.stringify(formData));

    // success message
    toast({
      title: 'Application Submitted',
      description: 'Your application has been saved.',
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
    setAvailability('');
    setSkills('');
    setCredentials('');
    setPreviousRoles('');

    if (!formComplete) {
      const storageKey = `tutorApplicationData_${userEmail || 'anonymous'}`;
      localStorage.removeItem(storageKey);

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
            Tutor Dashboard
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