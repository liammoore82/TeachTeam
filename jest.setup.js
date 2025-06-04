
import '@testing-library/jest-dom'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
})