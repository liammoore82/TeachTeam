import { ChakraProvider } from '@chakra-ui/react';
import { AppProps } from 'next/app';
import { AccountProvider } from '../context/AccountContext';
import theme from '../styles/theme';
import { useEffect } from 'react';

function MyApp({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Prevent unhandled promise rejection popup in development mode
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if it's an HTTP error that we're handling elsewhere
      if (event.reason?.response?.status >= 400 && event.reason?.response?.status < 600) {
        console.warn('HTTP error handled by application:', event.reason);
        event.preventDefault(); // Prevent the popup
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ChakraProvider theme={theme}>
      <AccountProvider>
        <Component {...pageProps} />
      </AccountProvider>
    </ChakraProvider>
  );
}

export default MyApp;
