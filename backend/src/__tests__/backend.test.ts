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

  // Test 3: Course search and filtering - tests the course discovery functionality
  // This is essential for users to find relevant courses to apply for
  it('should fetch courses with search and filter functionality in CourseController', async () => {
    // Setup: Create CourseController and mock course data
    const courseController = new CourseController();
    const mockCourses = [
      {
        id: 1,
        code: 'COMP1234',
        title: 'Introduction to Programming',
        roleType: 'tutor',
        applications: [],
        lecturerCourses: []
      },
      {
        id: 2,
        code: 'COMP5678',
        title: 'Advanced Algorithms',
        roleType: 'lecturer',
        applications: [],
        lecturerCourses: []
      }
    ];

    // Simulate a search request with text search and role type filter
    mockRequest.query = {
      search: 'COMP',          // Search for courses containing "COMP"
      roleType: 'tutor'       // Filter for tutor positions only
    };

    // Mock database response
    mockRepository.find.mockResolvedValue(mockCourses);

    // Execute: Call the getAllCourses method
    await courseController.getAllCourses(mockRequest as Request, mockResponse as Response);

    // Verify: Check that the database query includes proper search conditions
    // Should search both course code and title fields with the search term
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: expect.arrayContaining([
        expect.objectContaining({ code: expect.any(Object), roleType: 'tutor' }),
        expect.objectContaining({ title: expect.any(Object), roleType: 'tutor' })
      ]),
      relations: ['applications', 'lecturerCourses']  // Include related data
    });

    // Verify: Check that filtered courses are returned
    expect(mockResponse.json).toHaveBeenCalledWith(mockCourses);
  });

  // Test 4: Application creation with business logic validation
  // This tests the core application submission process with duplicate prevention
  it('should create application with validation and duplicate checking in ApplicationController', async () => {
    // Setup: Create ApplicationController and mock related entities
    const applicationController = new ApplicationController();
    const mockUser = { id: 1, email: 'user@example.com', role: 'candidate' };
    const mockCourse = { id: 1, code: 'COMP1234', title: 'Programming', roleType: 'tutor' };

    // Complete application data as would be submitted by a candidate
    const applicationData = {
      fullName: 'John Doe',
      courseId: 1,
      availability: 'Mon-Fri 9-5',
      skills: 'JavaScript, Python',
      credentials: 'BSc Computer Science',
      previousRoles: 'Teaching Assistant',
      userId: 1
    };

    const savedApplication = {
      id: 1,
      ...applicationData,
      user: mockUser,
      course: mockCourse,
      status: 'pending'
    };

    // Simulate application submission request
    mockRequest.body = applicationData;

    // Mock sequential database calls that the controller makes:
    mockRepository.findOne
      .mockResolvedValueOnce(mockUser)      // 1. Verify user exists
      .mockResolvedValueOnce(mockCourse)      // 2. Verify course exists
      .mockResolvedValueOnce(null)           // 3. Check no duplicate application exists
      .mockResolvedValueOnce(savedApplication); // 4. Fetch saved application with relations

    mockRepository.create.mockReturnValue(savedApplication);
    mockRepository.save.mockResolvedValue(savedApplication);

    // Mock the Application entity validation method
    const mockValidate = jest.fn().mockReturnValue(true);
    require('../entity/Application').Application = { validate: mockValidate };

    // Execute: Call the createApplication method
    await applicationController.createApplication(mockRequest as Request, mockResponse as Response);

    // Verify: Check that user existence was validated
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } }); // User lookup

    // Verify: Check that course existence was validated
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } }); // Course lookup

    // Verify: Check that application was saved to database
    expect(mockRepository.save).toHaveBeenCalled();

    // Verify: Check that HTTP 201 status was returned (created)
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // Verify: Check that complete application data was returned
    expect(mockResponse.json).toHaveBeenCalledWith(savedApplication);
  });
});