import { useState, useEffect } from "react";
import { Box, Button, Input, FormControl, FormErrorMessage, Alert, AlertIcon, VStack, Heading, Container, Text, Center } from "@chakra-ui/react";
import Header from '../components/Header'
import Footer from '../components/Footer'
import Sidebar from '../components/Sidebar'
import { useRouter } from "next/router";
import { useAuth } from "../context/AccountContext";

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

// Define user interface to include role
interface User {
  email: string;
  password: string;
  role: string;
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

  // Create dummy users with roles using loops
  useEffect(() => {
    
    const dummyUsers: User[] = [
      { email: "tutor@example.com", password: "Password123!", role: "tutor" },
      { email: "lecturer@example.com", password: "Password123!", role: "lecturer" },
    ];

    // Generate 10 additional tutors using a loop
    for (let i = 1; i <= 10; i++) {
      dummyUsers.push({
        email: `tutor${i}@example.com`,
        password: "Password123!",
        role: "tutor"
      });
    }

    // Generate 10 additional lecturers using a loop
    for (let i = 1; i <= 10; i++) {
      dummyUsers.push({
        email: `lecturer${i}@example.com`,
        password: "Password123!",
        role: "lecturer"
      });
    }

    localStorage.setItem("dummyUsers", JSON.stringify(dummyUsers));
  }, []);

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
  const handleSubmit = () => {
    if (validateForm()) {
      try {
        setGeneralError(null);
        
        // Get stored users from localStorage
        const dummyUsers: User[] = JSON.parse(localStorage.getItem("dummyUsers") || "[]");
        
        
        const cleanEmail = formState.email;

        // Check if provided credentials match any user
        const user = dummyUsers.find(
          (user: User) =>
            user.email === cleanEmail &&
            user.password === formState.password
        );

        if (user) {
          // Login successful
          setIsSuccess(true);

          // Call login function from authentication with role
          login(`token_${cleanEmail}`, user.role);

          // Redirect based on user role after a short delay
          setTimeout(() => {
            if (user.role === "lecturer") {
              router.push("/lecturer");
            } else if (user.role === "tutor") {
              router.push("/tutor");
            } else {
              // Fallback to home page
              router.push("/");
            }
          }, 1500);
        } else {
          // Login failed, show general error
          setGeneralError("Invalid email or password");
        }
      } catch (error) {
        console.error("Login error:", error);
        setGeneralError("An error occurred during login. Please try again.");
      }
    }
  };

  // Render the SignIn component UI
  return (
    <>
      {/* Add the Header component */}
      <Header />

      {/* Main form container */}
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
                Login successful! Redirecting...
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
                isDisabled={isSuccess}
                w="100%"
                py={6}
              >
                Sign In
              </Button>
            </Box>

            <Text fontSize="xs" color="gray.500" textAlign="center">
              Sample logins:<br />
              Tutor: tutor@example.com / Password123!<br />
              Lecturer: lecturer@example.com / Password123!<br />
              (Plus 10 more of each: tutor1-10@example.com, lecturer1-10@example.com)
            </Text>
          </VStack>
        </Box>
      </Container>
      {/* Footer */}
      <Footer />

    </>
  );
};

export default SignIn;