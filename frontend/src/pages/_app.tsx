import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { AccountProvider } from '../context/AccountContext';
import theme from '../styles/theme';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <AccountProvider>
        <Component {...pageProps} />
      </AccountProvider>
    </ChakraProvider>
  );
}

export default MyApp;
