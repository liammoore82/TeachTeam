import { useState } from "react";
import { Box, Button, Input, FormControl, FormErrorMessage, Alert, AlertIcon, VStack, Heading, Container, Text, Center, Select } from "@chakra-ui/react";
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useRouter } from "next/router";
// import { useAuth } from "../context/AccountContext"; // Not yet needed
// import { userService } from "../services/userService"; // Not yet needed

// Creating form interface
interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  role: 'candidate' | 'lecturer' | 'admin';
}

// Defining possible form validation errors
interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}

const SignUp = () => {
  // Get login function from authentication context (Placeholder for now)
  // const { login } = useAuth();

  // To redirect after signup
  const router = useRouter();

  // Initialize form with empty values
  const [formState, setFormState] = useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
    role: "candidate"
  });

  // Track validation errors
  const [errors, setErrors] = useState<FormErrors>({});

  // Flag successful signup (Placeholder for now)
  const [isSuccess, setIsSuccess] = useState(false);

  // General error message (Placeholder for now)
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Loading state (Placeholder for now)
  const [isLoading, setIsLoading] = useState(false);

  // Handle changes to input fields
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // For email field, automatically trim whitespace
    const cleanedValue = name === 'email' ? value.trim() : value;

    // Update form with new value
    setFormState((prev) => ({
      ...prev,
      [name]: cleanedValue
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined
      }));
    }

    // Clear general error when user starts typing again (if it exists)
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

    // Check if password meets requirements
    if (!formState.password) {
      newErrors.password = "Password is required";
    } else if (formState.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Check if passwords match
    if (!formState.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formState.password !== formState.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if role is selected
    if (!formState.role) {
      newErrors.role = "Please select a role";
    }

    // Update errors state
    setErrors(newErrors);

    // If no errors found, return true
    return Object.keys(newErrors).length === 0;
  };

  // Placeholder for form submission
  const handleSubmit = async () => {
    if (validateForm()) { // Only proceed if validation passes
      console.log("Form is valid, ready to submit (placeholder)");
      // ... (actual submission logic will go here in next commit)
    } else {
      console.log("Form has validation errors.");
    }
  };

  // Render the SignUp component UI
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
                Sign Up
              </Heading>
            </Center>

            <VStack spacing={6} align="stretch">
              {/* Alert for successful signup (still placeholder) */}
              {isSuccess && (
                <Alert status="success" borderRadius="md" bg="set.700" color="white">
                  <AlertIcon />
                  Welcome {formState.email.split('@')[0]}! Account created successfully! Redirecting...
                </Alert>
              )}

              {/* General error message (still placeholder) */}
              {generalError && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {generalError}
                </Alert>
              )}

              {/* Email input field */}
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

              {/* Confirm Password input field */}
              <FormControl isInvalid={!!errors.confirmPassword}>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formState.confirmPassword}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="set.700"
                  _hover={{ borderColor: "set.600" }}
                  _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
                  py={6}
                />
                {errors.confirmPassword && <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>}
              </FormControl>

              {/* Role selection */}
              <FormControl isInvalid={!!errors.role}>
                <Select
                  name="role"
                  value={formState.role}
                  onChange={handleInputChange}
                  bg="gray.800"
                  borderColor="set.700"
                  _hover={{ borderColor: "set.600" }}
                  _focus={{ borderColor: "set.500", boxShadow: "0 0 0 1px #38a169" }}
                  py={6}
                >
                  <option value="candidate">Candidate (Tutor/Lab Assistant)</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </Select>
                {errors.role && <FormErrorMessage>{errors.role}</FormErrorMessage>}
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
                  loadingText="Creating Account..."
                  w="100%"
                  py={6}
                >
                  Sign Up
                </Button>
              </Box>

              <Text fontSize="sm" color="gray.400" textAlign="center">
                Already have an account?{" "}
                <Text
                  as="span"
                  color="set.400"
                  cursor="pointer"
                  _hover={{ color: "set.300" }}
                  onClick={() => router.push('/SignIn')}
                >
                  Sign In
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

export default SignUp;