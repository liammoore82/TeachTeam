import { Request, Response } from 'express';
import { AuthController } from '../controller/AuthController';
import { UserController } from '../controller/UserController';
import { CourseController } from '../controller/CourseController';
import { ApplicationController } from '../controller/ApplicationController';
import { LecturerCourseController } from '../controller/LecturerCourseController';
import { LecturerSelectionController } from '../controller/LecturerSelectionController';
import { AppDataSource } from '../data-source';

jest.mock('../data-source');

describe('Backend Controllers', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockRepository);

    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    mockResponse = {
      json: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test 1: Core authentication functionality - validates user credentials and session management
  // This tests the most critical security feature of the application
  it('should authenticate user with valid credentials in AuthController', async () => {
    // Setup: Create AuthController instance and mock a valid user in the database
    const authController = new AuthController();
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      password: 'password123',
      role: 'candidate',
      toSafeObject: jest.fn().mockReturnValue({
        id: 1,
        email: 'test@example.com',
        role: 'candidate'
      })
    };

    // Simulate a sign-in request with valid email and password
    mockRequest.body = {
      email: 'test@example.com',
      password: 'password123'
    };

    // Mock database response to return the user when searched by email
    mockRepository.findOne.mockResolvedValue(mockUser);

    // Execute: Call the signIn method
    await authController.signIn(mockRequest as Request, mockResponse as Response);

    // Verify: Check that the database was queried with the correct email
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'test@example.com' }
    });

    // Verify: Check that the response contains the safe user object (without password)
    expect(mockResponse.json).toHaveBeenCalledWith({
      user: {
        id: 1,
        email: 'test@example.com',
        role: 'candidate'
      }
    });
  });

  // Test 2: User creation and management - tests the core user registration functionality
  // This ensures new users can be properly added to the system
  it('should create a new user successfully in UserController', async () => {
    // Setup: Create UserController instance and prepare user data
    const userController = new UserController();
    const userData = {
      email: 'newuser@example.com',
      password: 'password123',
      role: 'candidate'
    };

    // Mock the saved user response from database
    const savedUser = {
      id: 1,
      ...userData
    };

    // Simulate a user creation request
    mockRequest.body = userData;
    mockRepository.save.mockResolvedValue(savedUser);

    // Execute: Call the save method to create user
    await userController.save(mockRequest as Request, mockResponse as Response);

    // Verify: Check that the user data was properly saved to database
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(userData)
    );

    // Verify: Check that HTTP 201 status was returned (created)
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // Verify: Check that the saved user data was returned in response
    expect(mockResponse.json).toHaveBeenCalledWith(savedUser);
  });
});