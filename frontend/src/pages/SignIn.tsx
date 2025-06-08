import { useState, useEffect } from "react";
import { Box, Button, Input, FormControl, FormErrorMessage, Alert, AlertIcon, VStack, Heading, Container, Text, Center } from "@chakra-ui/react";
import Header from '../components/Header'
import Footer from '../components/Footer'
import { useRouter } from "next/router";
import { useAuth } from "../context/AccountContext";
import { userService } from "../services/userService";
import { courseService } from "../services/courseService";

// Creating form interface
interface FormState {
  email: string;
  password: string;
}

// Defining possible form validation errors
interface FormErrors {
  email?: string;
  password?: string;
}


const SignIn = () => {
  // Get login function from authentication
  const { login } = useAuth();

  // To redirect after login
  const router = useRouter();

  // Initialize form with empty values
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: ""
  });

  // Track validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Flag successful login
  const [isSuccess, setIsSuccess] = useState(false);
  
  // General error message
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Create sample users and courses in database on component mount
  useEffect(() => {
    createSampleDataInDatabase();
  }, []);

  const createSampleDataInDatabase = async () => {
    await createSampleUsersInDatabase();
    await createSampleCoursesInDatabase();
  };

  const createSampleUsersInDatabase = async () => {
    try {
      // Sample users to create
      const sampleUsers: Array<{email: string, password: string, role: 'candidate' | 'lecturer' | 'admin'}> = [
        { email: "tutor@example.com", password: "Password123!", role: "candidate" },
        { email: "lecturer@example.com", password: "Password123!", role: "lecturer" },
      ];

      // Generate additional sample users
      for (let i = 1; i <= 3; i++) {
        sampleUsers.push({
          email: `tutor${i}@example.com`,
          password: "Password123!",
          role: "candidate"
        });
      }

      for (let i = 1; i <= 3; i++) {
        sampleUsers.push({
          email: `lecturer${i}@example.com`,
          password: "Password123!",
          role: "lecturer"
        });
      }

      // Try to create each user (ignore if they already exist)
      for (const userData of sampleUsers) {
        try {
          await userService.createUser(userData);
        } catch (error) {
          // User probably already exists, continue with next one
          console.log(`User ${userData.email} may already exist`);
        }
      }
    } catch (error) {
      console.error('Error creating sample users:', error);
    }
  };

  const createSampleCoursesInDatabase = async () => {
    try {
      // Sample courses to create
      const sampleCourses = [
        { code: "COSC1822", title: "Full Stack Development", roleType: "Tutor" as const },
        { code: "COSC8288", title: "Programming Studio 2", roleType: "Tutor" as const },
        { code: "COSC3945", title: "Software Engineering Fundamentals", roleType: "Lab Assistant" as const },
        { code: "COSC5324", title: "Programming Bootcamp 2", roleType: "Tutor" as const },
      ];

      // Try to create each course (ignore if they already exist)
      for (const courseData of sampleCourses) {
        try {
          await courseService.createCourse(courseData);
          console.log(`Created course: ${courseData.code}`);
        } catch (error) {
          // Course probably already exists, continue with next one
          console.log(`Course ${courseData.code} may already exist`);
        }
      }
    } catch (error) {
      console.error('Error creating sample courses:', error);
    }
  };

  // Handle changes to input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // For email field, automatically trim whitespace
    const cleanedValue = name === 'email' ? value.trim() : value;

    // Update form with new value
    setFormState((prev) => ({
      ...prev,
      [name]: cleanedValue
    }));

    // Once users start typing, this clears the form of previous errors
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Clear general error when user starts typing again
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Validate form inputs before submission
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Check if email is provided and has valid format
    if (!formState.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formState.email)) {
      newErrors.email = "Email is invalid";
    }

    // Check if password meets minimum requirements
    if (!formState.password) {
      newErrors.password = "Password is required";
    } else if (formState.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Update errors state
    setErrors(newErrors);

    // If no errors found, return True
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (validateForm()) {
      setIsLoading(true);
      setGeneralError(null);
      
      try {
        // Authenticate user through API
        const response = await userService.signIn({
          email: formState.email,
          password: formState.password
        });

        // Login successful
        setIsSuccess(true);

        // Call login function from authentication with role
        login(`token_${response.user.email}`, response.user.role);

        // Redirect based on user role after a short delay
        setTimeout(() => {
          if (response.user.role === "lecturer") {
            router.push("/lecturer");
          } else if (response.user.role === "candidate") {
            router.push("/tutor");
          } else if (response.user.role === "admin") {
            router.push("/admin");
          } else {
            // Fallback to home page
            router.push("/");
          }
        }, 1500);

      } catch (error: any) {
        // Prevent unhandled promise rejection popup in development
        console.warn("Login error (handled):", error);
        
        if (error.response?.status === 401) {
          setGeneralError("Invalid email or password");
        } else if (error.response?.status === 403) {
          // Handle blocked user
          const blockMessage = error.response?.data?.message || "Your account has been blocked by an administrator.";
          setGeneralError(blockMessage);
        } else {
          setGeneralError("An error occurred during login. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render the SignIn component UI
  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      
      {/* Add the Header component */}
      <Header />

      {/* Main form container */}
      <Box flex="1">
        <Container maxW="md" py={10}>
          <Box
            bg="gray.900"
            borderColor="set.700"
            borderWidth="1px"
            borderRadius="md"
            boxShadow="lg"
            p={6}
          >
            <Center mb={6}>
              <Heading as="h2" size="lg" fontFamily="heading" color="white">
                Sign In
              </Heading>
            </Center>

            <VStack spacing={6} align="stretch">
              {/* Alert for successful login */}
              {isSuccess && (
                <Alert status="success" borderRadius="md" bg="set.700" color="white">
                  <AlertIcon />
                  Welcome {formState.email.split('@')[0]}! Redirecting...
                </Alert>
              )}

              {/* General error message */}
              {generalError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {generalError}
                </Alert>
              )}


              <FormControl isInvalid={!!errors.email}>
                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formState.email}
                  onChange={handleInputChange}
                  onKeyDown={(e) => {
                    // Prevent spacebar input when field is empty
                    if (e.key === " " && formState.email === "") {
                      e.preventDefault();
                    }
                  }}
                  onPaste={(e) => {
                    // Clean pasted email addresses
                    const pastedText = e.clipboardData.getData('text');
                    e.preventDefault();
                    
                    
                    const trimmedText = pastedText.trim();
                    setFormState(prev => ({
                      ...prev,
                      email: trimmedText
                    }));
                    
                    // Clear any existing errors
                    if (errors.email) {
                      setErrors(prev => ({ ...prev, email: undefined }));
                    }
                    if (generalError) {
                      setGeneralError(null);
                    }
                  }}
                  bg="gray.800"
                  borderColor="set.700"
                  _hover={{ borderColor: "set.600" }}
                  _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
                  py={6}
                />
                {errors.email && <FormErrorMessage>{errors.email}</FormErrorMessage>}
              </FormControl>

              {/* Password input field */}
              <FormControl isInvalid={!!errors.password}>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formState.password}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="set.700"
                  _hover={{ borderColor: "set.600" }}
                  _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
                  py={6}
                />
                {errors.password && <FormErrorMessage>{errors.password}</FormErrorMessage>}
              </FormControl>

              {/* Submit button */}
              <Box pt={2}>
                <Button
                  bg="set.500"
                  color="white"
                  _hover={{ bg: "set.400" }}
                  onClick={handleSubmit}
                  isDisabled={isSuccess || isLoading}
                  isLoading={isLoading}
                  loadingText="Signing In..."
                  w="100%"
                  py={6}
                >
                  Sign In
                </Button>
              </Box>

              <Text fontSize="xs" color="gray.500" textAlign="center">
                Sample logins:<br />
                Candidate: tutor@example.com / Password123!<br />
                Lecturer: lecturer@example.com / Password123!<br />
                (Plus 3 more of each: tutor1-3@example.com, lecturer1-3@example.com)
              </Text>

              <Text fontSize="sm" color="gray.400" textAlign="center">
                Don't have an account?{" "}
                <Text 
                  as="span" 
                  color="set.400" 
                  cursor="pointer" 
                  _hover={{ color: "set.300" }}
                  onClick={() => router.push('/SignUp')}
                >
                  Sign Up
                </Text>
              </Text>
            </VStack>
          </Box>
        </Container>
      </Box>

      {/* Footer Component*/}
      <Footer />
    </Box>
  );
};

export default SignIn;