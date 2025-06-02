import { Box, Button, Input, FormControl, FormLabel } from "@chakra-ui/react";

const SignUp = () => {

  return (
    <Box>
      <FormControl>
        <FormLabel>Username</FormLabel>
        <Input type="text" placeholder="Username" />
      </FormControl>
      <FormControl>
        <FormLabel>Password</FormLabel>
        <Input type="password" placeholder="Password" />
      </FormControl>
      <Button>Sign Up</Button>
    </Box>
  );
};

export default SignUp;
