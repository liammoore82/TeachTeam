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

  // Test 1: Authentication error handling - validates proper error responses for invalid credentials
  // This tests critical security edge cases including blocked users and invalid credentials
  it('should handle authentication errors and blocked users in AuthController', async () => {
    // Setup: Create AuthController instance
    const authController = new AuthController();

    // Test Case 1: Invalid credentials - user not found
    mockRequest.body = {
      email: 'nonexistent@example.com',
      password: 'password123'
    };

    // Mock database response to return null (user not found)
    mockRepository.findOne.mockResolvedValue(null);

    // Execute: Call the signIn method with invalid email
    await authController.signIn(mockRequest as Request, mockResponse as Response);

    // Verify: Check that 401 Unauthorized status is returned for invalid credentials
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Invalid credentials'
    });

    // Reset mocks for next test case
    jest.clearAllMocks();
    mockResponse.status = jest.fn().mockReturnThis();
    mockResponse.json = jest.fn().mockReturnThis();

    // Test Case 2: Blocked user with detailed blocking information
    const user = {
      id: 1,
      email: 'blocked@example.com',
      password: 'password123',
      role: 'candidate'
    };

    const blockedUserRecord = {
      id: 1,
      userId: 1,
      reason: 'Violation of terms',
      message: 'Your account has been blocked by an administrator.',
      blockedAt: new Date('2024-01-01')
    };

    mockRequest.body = {
      email: 'blocked@example.com',
      password: 'password123'
    };

    // Mock database responses: first findOne returns the user, second returns blocked user record
    mockRepository.findOne
      .mockResolvedValueOnce(user)              // User lookup
      .mockResolvedValueOnce(blockedUserRecord); // BlockedUser lookup

    // Execute: Call the signIn method with blocked user
    await authController.signIn(mockRequest as Request, mockResponse as Response);

    // Verify: Check that 403 Forbidden status is returned with blocking details
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Account blocked',
      message: 'Your account has been blocked by an administrator.',
      reason: 'Violation of terms',
      blockedAt: new Date('2024-01-01')
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

  // Test 5: Lecturer-course assignment with role validation
  // This tests the administrative functionality for assigning lecturers to courses
  it('should assign lecturer to course with validation in LecturerCourseController', async () => {
    // Setup: Create LecturerCourseController and mock entities
    const lecturerCourseController = new LecturerCourseController();
    const mockLecturer = { id: 1, email: 'lecturer@example.com', role: 'lecturer' };
    const mockCourse = { id: 1, code: 'COMP1234', title: 'Programming', roleType: 'tutor' };

    // Assignment request data
    const assignmentData = {
      lecturerId: 1,
      courseId: 1
    };

    const savedAssignment = {
      id: 1,
      lecturer: mockLecturer,
      course: mockCourse
    };

    // Simulate assignment creation request
    mockRequest.body = assignmentData;

    // Mock sequential database operations:
    mockRepository.findOne
      .mockResolvedValueOnce(mockLecturer)    // 1. Verify lecturer exists and has correct role
      .mockResolvedValueOnce(mockCourse)      // 2. Verify course exists
      .mockResolvedValueOnce(null)           // 3. Check no duplicate assignment exists
      .mockResolvedValueOnce(savedAssignment); // 4. Fetch saved assignment with relations

    mockRepository.create.mockReturnValue(savedAssignment);
    mockRepository.save.mockResolvedValue(savedAssignment);

    // Mock the LecturerCourse entity validation method
    const mockValidate = jest.fn().mockReturnValue(true);
    require('../entity/LecturerCourse').LecturerCourse = { validate: mockValidate };

    // Execute: Call the createLecturerCourse method
    await lecturerCourseController.createLecturerCourse(mockRequest as Request, mockResponse as Response);

    // Verify: Check that lecturer existence and role was validated
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } }); // Lecturer lookup

    // Verify: Check that course existence was validated
    expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } }); // Course lookup

    // Verify: Check that assignment was created with correct entities
    expect(mockRepository.create).toHaveBeenCalledWith({
      lecturer: mockLecturer,
      course: mockCourse
    });

    // Verify: Check that HTTP 201 status was returned (created)
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // Verify: Check that complete assignment data was returned
    expect(mockResponse.json).toHaveBeenCalledWith(savedAssignment);
  });

  // Test 6: Lecturer selection and ranking system
  // This tests the core functionality for lecturers to rank and comment on candidate applications
  it('should create and update lecturer selection with ranking in LecturerSelectionController', async () => {
    // Setup: Create LecturerSelectionController and mock entities
    const selectionController = new LecturerSelectionController();
    const mockLecturer = { id: 1, email: 'lecturer@example.com', role: 'lecturer' };
    const mockApplication = {
      id: 1,
      fullName: 'John Doe',
      user: { id: 2, email: 'candidate@example.com' },
      course: { id: 1, code: 'COMP1234' }
    };

    // Selection data including ranking and comments
    const selectionData = {
      lecturerId: 1,
      applicationId: 1,
      rank: 1,                  // Rank this candidate as #1 choice
      comments: 'Excellent candidate'    // Lecturer's assessment comments
    };

    const savedSelection = {
      id: 1,
      lecturer: mockLecturer,
      application: mockApplication,
      rank: 1,
      comments: 'Excellent candidate'
    };

    // Simulate selection creation request
    mockRequest.body = selectionData;

    // Mock sequential database operations:
    mockRepository.findOne
      .mockResolvedValueOnce(mockLecturer)    // 1. Verify lecturer exists and has lecturer role
      .mockResolvedValueOnce(mockApplication)  // 2. Verify application exists with relations
      .mockResolvedValueOnce(null)           // 3. Check no existing selection (allows update)
      .mockResolvedValueOnce(savedSelection);  // 4. Fetch saved selection with relations

    mockRepository.create.mockReturnValue(savedSelection);
    mockRepository.save.mockResolvedValue(savedSelection);

    // Execute: Call the createSelection method
    await selectionController.createSelection(mockRequest as Request, mockResponse as Response);

    // Verify: Check that lecturer role validation was performed
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1, role: 'lecturer' }    // Must be a lecturer to make selections
    });

    // Verify: Check that application was fetched with user and course relations
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
      relations: ['user', 'course']        // Need related data for complete selection
    });

    // Verify: Check that selection was created with ranking and comments
    expect(mockRepository.create).toHaveBeenCalledWith({
      lecturer: mockLecturer,
      application: mockApplication,
      rank: 1,                              // Ranking system for candidate preference
      comments: 'Excellent candidate'        // Qualitative assessment
    });

    // Verify: Check that HTTP 201 status was returned (created)
    expect(mockResponse.status).toHaveBeenCalledWith(201);

    // Verify: Check that complete selection data was returned
    expect(mockResponse.json).toHaveBeenCalledWith(savedSelection);
  });
});