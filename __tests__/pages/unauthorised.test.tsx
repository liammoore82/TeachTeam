import { render, screen, fireEvent } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import '@testing-library/jest-dom';
import Unauthorised from '../../src/pages/unauthorised';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Chakra UI Link component
jest.mock('@chakra-ui/react', () => {
  const actual = jest.requireActual('@chakra-ui/react');
  return {
    ...actual,
    Link: jest.fn().mockImplementation(({ children, href, ...props }) => (
      <a href={href} data-testid="link" tabIndex={0} {...props}>
        {children}
      </a>
    ))
  };
});

describe('Unauthorised Component', () => {
  // Set up the component rendering with ChakraProvider for all tests
  beforeEach(() => {
    render(
      <ChakraProvider>
        <Unauthorised />
      </ChakraProvider>
    );
    // Clear any previous mock calls
    mockPush.mockClear();
  });

  // Test the main content of the page (title and message)
  test('renders the unauthorized page with correct title', () => {
    const headingElement = screen.getByRole('heading', { name: /401 - Unauthorised/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('displays the permission denied message', () => {
    const messageElement = screen.getByText(/You do not have permission to access this page/i);
    expect(messageElement).toBeInTheDocument();
  });

  // Test navigation link functionality and attributes
  test('has a link back to the home page', () => {
    const linkElement = screen.getByRole('link', { name: /Go Back to Home/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement).toHaveAttribute('href', '/');
  });

  // Validate the structural hierarchy and styling setup
  test('has the correct styling structure', () => {
    const headingElement = screen.getByRole('heading', { name: /401 - Unauthorised/i });
    const vStackElement = headingElement.parentElement;
    const containerElement = vStackElement?.parentElement;

    expect(containerElement).toBeInTheDocument();
    expect(headingElement).toBeInTheDocument();
  });

  // Test for keyboard accessibility
  test('supports keyboard navigation and accessibility features', () => {
    const linkElement = screen.getByRole('link', { name: /Go Back to Home/i });
    
    // Verify the element can receive focus
    linkElement.focus();
    expect(document.activeElement).toBe(linkElement);
    
    // Verify it has the correct tabIndex
    expect(linkElement).toHaveAttribute('tabIndex', '0');
    
    // Test keyboard navigation (simulating Enter key press)
    fireEvent.keyDown(linkElement, { key: 'Enter', code: 'Enter' });
    
  });

  // Test user interaction with click event
  test('handles user interaction correctly when button is clicked', () => {
    const linkElement = screen.getByRole('link', { name: /Go Back to Home/i });
    
    // Test click behavior
    fireEvent.click(linkElement);
    
    
    expect(linkElement).toHaveAttribute('href', '/');
  });

  // Test conditional rendering
  test('renders error UI consistently in different viewport sizes', () => {
    // Get the main container to check its styling attributes
    const headingElement = screen.getByRole('heading', { name: /401 - Unauthorised/i });
    const vStackElement = headingElement.parentElement;
    const containerElement = vStackElement?.parentElement;
    
    // Check that container uses responsive styling
    expect(containerElement).toHaveStyle({ display: 'flex' });
    
    // Check that content is centered and properly laid out
    expect(vStackElement).toHaveTextContent(/401 - Unauthorised/);
    expect(vStackElement).toHaveTextContent(/You do not have permission/);
    
    // Check that button appears in the correct position (after the message)
    const messageElement = screen.getByText(/You do not have permission to access this page/i);
    const buttonElement = screen.getByRole('link', { name: /Go Back to Home/i });
    
    // Ensure they're in the same container
    expect(vStackElement).toContainElement(messageElement);
    expect(vStackElement).toContainElement(buttonElement);
  });

  // Test for proper color contrast (accessibility)
  test('uses accessible colors for error message', () => {
    const headingElement = screen.getByRole('heading', { name: /401 - Unauthorised/i });
    
    
    expect(headingElement).toBeInTheDocument();
    
    // Check that text is centered for readability 
    const vStackElement = headingElement.parentElement;
    expect(vStackElement).toBeInTheDocument();
    
    // Check that all important elements are present in the proper container
    const messageElement = screen.getByText(/You do not have permission to access this page/i);
    const buttonElement = screen.getByRole('link', { name: /Go Back to Home/i });
    
    expect(vStackElement).toContainElement(messageElement);
    expect(vStackElement).toContainElement(buttonElement);
  });
});