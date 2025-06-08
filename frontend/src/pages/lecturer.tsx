import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import {
  Container, Heading, Center, Box, Tabs, TabList, TabPanels, Tab, TabPanel,
  useToast, Flex
} from '@chakra-ui/react';
import { useAuth } from '../context/AccountContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ApplicationsTab from '../components/lecturer/ApplicationsTab';
import SelectedCandidatesTab from '../components/lecturer/SelectedCandidatesTab';
import StatisticsTab from '../components/lecturer/StatisticsTab';
import ApplicationDetailsModal from '../components/lecturer/ApplicationDetailsModal';
import EditCommentModal from '../components/lecturer/EditCommentModal';
import { TutorApplication, SelectedCandidate } from '../types/tutor';
import { applicationService } from '../services/applicationService';
import { courseService, Course } from '../services/courseService';
import { lecturerSelectionService } from '../services/lecturerSelectionService';
import { userService } from '../services/userService';
import { lecturerCourseService, Course as LecturerCourse } from '../services/lecturerCourseService';


export const courseMap: {[key: string]: string} = {
  'COSC1822': 'Full Stack Development',
  'COSC8288': 'Programming Studio 2',
  'COSC3945': 'Software Engineering Fundamentals',
  'COSC5324': 'Programming Bootcamp 2',
};

// component for the Lecturer dashboard page

const LecturerPage = () => {
  
  const { signedIn, userRole, userEmail } = useAuth();
  const router = useRouter();
  const toast = useToast();
  
  
  // These manage the component's state for applications and filtering
  const [allApplications, setAllApplications] = useState<TutorApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<TutorApplication[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<SelectedCandidate[]>([]);
  const [allLecturerSelections, setAllLecturerSelections] = useState<{[key: string]: SelectedCandidate[]}>({});
  const [statisticsLoaded, setStatisticsLoaded] = useState<boolean>(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerCourses, setLecturerCourses] = useState<LecturerCourse[]>([]);
  const hasShownNoCoursesMessage = useRef<boolean>(false);
  
  // Modal states for handling application details and comments
  const [selectedApplication, setSelectedApplication] = useState<TutorApplication | null>(null);
  const [candidateComment, setCandidateComment] = useState<string>('');
  const [editingCandidate, setEditingCandidate] = useState<SelectedCandidate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filter states for application filtering and sorting
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>(''); // New role filter
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchBy, setSearchBy] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [sortOrder, setSortOrder] = useState<string>('desc');
  
  
  
  useEffect(() => {
    if (!signedIn) {
      router.push('/unauthorised');
      return;
    }

    if (userRole !== 'lecturer') {
      router.push('/unauthorised');
      return;
    }
    // Load applications data if authentication passes
    loadDataFromAPI();
  }, [signedIn, userRole, router]); 

  // Load selected candidates when currentUser or applications change
  useEffect(() => {
    if (currentUser) {
      loadSelectedCandidates();
    }
  }, [currentUser, allApplications]);
  
  // Load statistics when component first mounts
  
  useEffect(() => {
    loadAllLecturerSelections();
  }, []);

  // Filter applications when filter criteria change (added selectedRoleFilter)
  useEffect(() => {
    filterAndSortApplications();
  }, [selectedCourseFilter, selectedRoleFilter, selectedAvailabilityFilter, allApplications, searchQuery, searchBy, sortBy, sortOrder]);

  // Function to filter and sort applications based on current criteria
  
  const filterAndSortApplications = (): void => {
    
    let result = [...allApplications];
    
    // Apply course filter if selected
    if (selectedCourseFilter) {
      result = result.filter(app => app.selectedCourse === selectedCourseFilter);
    }

    // Apply role filter if selected
    if (selectedRoleFilter) {
      result = result.filter(app => app.selectedRole === selectedRoleFilter);
    }
    
    // Apply availability filter if selected
    if (selectedAvailabilityFilter) {
      result = result.filter(app => app.availability === selectedAvailabilityFilter);
    }
    
    // Apply search filter if query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // Filter based on search type or search all fields
      result = result.filter(app => {
        if (searchBy === 'name') return app.name.toLowerCase().includes(query);
        if (searchBy === 'email') return app.email.toLowerCase().includes(query);
        if (searchBy === 'course') {
          return app.selectedCourse.toLowerCase().includes(query) || 
            (courseMap[app.selectedCourse] && courseMap[app.selectedCourse].toLowerCase().includes(query));
        }
        if (searchBy === 'role') return app.selectedRole.toLowerCase().includes(query);
        if (searchBy === 'availability') return app.availability.toLowerCase().includes(query);
        if (searchBy === 'skills') return app.skills.toLowerCase().includes(query);
        
        // If searchBy is 'all', search across all fields
        return (
          app.name.toLowerCase().includes(query) ||
          app.email.toLowerCase().includes(query) ||
          app.selectedCourse.toLowerCase().includes(query) ||
          (courseMap[app.selectedCourse] && courseMap[app.selectedCourse].toLowerCase().includes(query)) ||
          app.selectedRole.toLowerCase().includes(query) ||
          app.availability.toLowerCase().includes(query) ||
          app.skills.toLowerCase().includes(query) ||
          app.credentials.toLowerCase().includes(query) ||
          app.previousRoles.toLowerCase().includes(query)
        );
      });
    }
    
    // Apply sorting based on selected criteria
    
    result.sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      // Determine which field to sort by
      if (sortBy === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (sortBy === 'course') {
        valueA = a.selectedCourse;
        valueB = b.selectedCourse;
      } else if (sortBy === 'role') {
        valueA = a.selectedRole;
        valueB = b.selectedRole;
      } else if (sortBy === 'availability') {
        valueA = a.availability;
        valueB = b.availability;
      } else {
        
        valueA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        valueB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      }
      
      // Apply sort order (ascending or descending)
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    // Update filtered applications state with the result
    setFilteredApplications(result);
  };

  // Load data from API
  const loadDataFromAPI = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Load courses, current user first
      const [coursesData, userData] = await Promise.all([
        courseService.getAllCourses(),
        userService.getCurrentUser(userEmail!)
      ]);
      
      setCourses(coursesData);
      setCurrentUser(userData);
      
      // Get lecturer's assigned courses
      const assignedCourses = await lecturerCourseService.getCoursesByLecturer(userData.id);
      setLecturerCourses(assignedCourses);
      
      // If lecturer has no assigned courses, show empty applications
      if (assignedCourses.length === 0) {
        setAllApplications([]);
        setFilteredApplications([]);
        
        // Only show the message once
        if (!hasShownNoCoursesMessage.current) {
          hasShownNoCoursesMessage.current = true;
          toast({
            title: 'No Courses Assigned',
            description: 'You have not been assigned to any courses yet. Contact an administrator.',
            status: 'info',
            duration: 5000,
            isClosable: true,
          });
        }
        
        return;
      }
      
      // Get applications only for assigned courses
      const assignedCourseIds = assignedCourses.map(course => course.id);
      const applicationPromises = assignedCourseIds.map(courseId => 
        applicationService.getApplicationsByCourse(courseId)
      );
      
      const applicationsArrays = await Promise.all(applicationPromises);
      const allApplicationsForLecturer = applicationsArrays.flat();
      
      setAllApplications(allApplicationsForLecturer);
      setFilteredApplications(allApplicationsForLecturer);
      
      // Create course map from API data
      const dynamicCourseMap: {[key: string]: string} = {};
      coursesData.forEach(course => {
        dynamicCourseMap[course.code] = course.title;
      });
      
      // Update the global courseMap if needed
      Object.assign(courseMap, dynamicCourseMap);
      
    } catch (error) {
      console.error('Error loading data from API:', error);
      toast({
        title: 'Error Loading Data',
        description: 'Failed to load applications. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      // Fallback to mock data if API fails
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock data
  const loadMockData = (): void => {
    const mockApplications: TutorApplication[] = [
      {
        id: 'mock_john.doe@example.com_tutor',
        name: 'John Doe',
        selectedCourse: 'COSC1822',
        selectedRole: 'tutor',
        availability: 'part-time',
        skills: 'JavaScript, React, Node.js, Express, MongoDB',
        credentials: 'Bachelor of Computer Science, RMIT University',
        previousRoles: 'Lab demonstrator for Programming 1',
        email: 'john.doe@example.com',
        timestamp: '2025-03-15T10:30:00Z',
        status: 'pending'
      },
      {
        id: 'mock_jane.smith@example.com_lab-assistant',
        name: 'Jane Smith',
        selectedCourse: 'COSC3945',
        selectedRole: 'lab-assistant',
        availability: 'full-time',
        skills: 'Java, Spring Boot, SQL, Git, Docker',
        credentials: 'Master of Software Engineering, University of Melbourne',
        previousRoles: '',
        email: 'jane.smith@example.com',
        timestamp: '2025-03-18T14:20:00Z',
        status: 'approved'
      },
      {
        id: 'mock_alex.brown@example.com_tutor',
        name: 'Alex Brown',
        selectedCourse: 'COSC8288',
        selectedRole: 'tutor',
        availability: 'part-time',
        skills: 'Python, Django, REST APIs, PostgreSQL',
        credentials: 'Bachelor of Information Technology, Monash University',
        previousRoles: 'Tutor for Introduction to Programming',
        email: 'alex.brown@example.com',
        timestamp: '2025-03-20T09:15:00Z',
        status: 'pending'
      }
    ];
    
    setAllApplications(mockApplications);
    setFilteredApplications(mockApplications);
  };

  // Load statistics for all lecturer selections from API
  const loadAllLecturerSelections = async (): Promise<void> => {
    try {
      // Get all lecturer selections from API
      const allSelections = await lecturerSelectionService.getAllSelections();
      
      // Group selections by lecturer ID
      const selectionsByLecturer: {[key: string]: SelectedCandidate[]} = {};
      
      allSelections.forEach(selection => {
        const lecturerId = selection.lecturer.id.toString();
        
        if (!selectionsByLecturer[lecturerId]) {
          selectionsByLecturer[lecturerId] = [];
        }
        
        // Convert API selection to SelectedCandidate format
        const candidate: SelectedCandidate = {
          applicationId: selection.application.id.toString(),
          name: selection.application.fullName,
          email: selection.application.user.email,
          course: selection.application.course.code,
          role: 'tutor', // Default role, could be enhanced based on application data
          rank: selection.rank,
          comments: selection.comments || ''
        };
        
        selectionsByLecturer[lecturerId].push(candidate);
      });
      
      setAllLecturerSelections(selectionsByLecturer);
      setStatisticsLoaded(true);
    } catch (error) {
      console.error('Error loading all lecturer selections:', error);
      // Fallback to empty selections if API fails
      setAllLecturerSelections({});
      setStatisticsLoaded(true);
    }
  };

  // Load selected candidates from API
  const loadSelectedCandidates = async (): Promise<void> => {
    if (!currentUser) return;

    try {
      const selections = await lecturerSelectionService.getSelectionsByLecturer(currentUser.id);
      
      // Transform API selections to SelectedCandidate format
      const candidates: SelectedCandidate[] = selections.map(selection => ({
        applicationId: selection.application.id.toString(),
        name: selection.application.fullName,
        email: selection.application.user.email,
        course: selection.application.course.code,
        role: (selection.application.course as any).roleType === 'Tutor' ? 'tutor' : 'lab-assistant',
        rank: selection.rank,
        comments: selection.comments || ''
      }));

      setSelectedCandidates(candidates);
    } catch (error) {
      console.error('Error loading selected candidates:', error);
      setSelectedCandidates([]);
    }
  };

  // Handler for viewing application details
  
  const viewApplicationDetails = (application: TutorApplication): void => {
    setSelectedApplication(application);
    
    // Find if this candidate is already selected
    const existingCandidate = selectedCandidates.find(
      c => c.applicationId === application.id
    );
    
    // Set comment from existing selection or empty string
    setCandidateComment(existingCandidate ? existingCandidate.comments : '');
    setIsModalOpen(true);
  };

  // Handler for selecting a candidate
  const selectCandidate = async (): Promise<void> => {
    if (!selectedApplication || !currentUser) return;
    
    try {
      // Check if candidate already exists
      const existingIndex = selectedCandidates.findIndex(
        c => c.applicationId === selectedApplication.id
      );
      
      // Calculate rank based on existing candidates for the same course
      const candidatesForSameCourse = selectedCandidates.filter(c => c.course === selectedApplication.selectedCourse);
      const rank = existingIndex >= 0 ? selectedCandidates[existingIndex].rank : candidatesForSameCourse.length + 1;
      
      // Save selection to API
      await lecturerSelectionService.createSelection({
        lecturerId: currentUser.id,
        applicationId: parseInt(selectedApplication.id),
        rank,
        comments: candidateComment
      });

      // Reload selected candidates from API
      await loadSelectedCandidates();
      
      await loadAllLecturerSelections();
      
      toast({
        title: existingIndex >= 0 ? 'Candidate Updated' : 'Candidate Selected',
        description: `${selectedApplication.name} has been ${existingIndex >= 0 ? 'updated' : 'added to selected candidates'}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Close the modal
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('Error selecting candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to select candidate. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler for removing a candidate
  const removeCandidate = async (applicationId: string): Promise<void> => {
    if (!currentUser) return;

    try {
      // Remove selection via API
      await lecturerSelectionService.deleteSelectionByIds(currentUser.id, parseInt(applicationId));
      
      // Reload selected candidates from API
      await loadSelectedCandidates();
      
      // Refresh statistics after removal
      await loadAllLecturerSelections();
      
      toast({
        title: 'Candidate Removed',
        description: 'The candidate has been removed from your selection.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Error removing candidate:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove candidate. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler for changing candidate rank order
  const moveRank = async (applicationId: string, direction: 'up' | 'down'): Promise<void> => {
    if (!currentUser) return;

    const candidateIndex = selectedCandidates.findIndex(c => c.applicationId === applicationId);
    if (candidateIndex === -1) return;
    
    const candidate = selectedCandidates[candidateIndex];
    
    // Checks if movement is possible
    if ((direction === 'up' && candidate.rank === 1) || 
        (direction === 'down' && candidate.rank === selectedCandidates.length)) {
      return;
    }
    
    // Find the candidate to swap with
    const newRank = direction === 'up' ? candidate.rank - 1 : candidate.rank + 1;
    const otherCandidate = selectedCandidates.find(c => c.rank === newRank);
    
    if (!otherCandidate) return;
    
    try {
      // Create reorder request
      const reorderData = [
        { selectionId: parseInt(applicationId), newRank },
        { selectionId: parseInt(otherCandidate.applicationId), newRank: candidate.rank }
      ];
      
      // Update ranks via API
      await lecturerSelectionService.reorderSelections({
        lecturerId: currentUser.id,
        selections: reorderData
      });
      
      // Reload selected candidates from API
      await loadSelectedCandidates();
      
    } catch (error) {
      console.error('Error reordering candidates:', error);
      toast({
        title: 'Error',
        description: 'Failed to reorder candidates. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handler for saving candidate comments
  const saveComment = async (): Promise<void> => {
    if (!editingCandidate || !currentUser) return;
    
    try {
      // Find the selection in the API
      const selections = await lecturerSelectionService.getSelectionsByLecturer(currentUser.id);
      const selection = selections.find(s => s.application.id.toString() === editingCandidate.applicationId);
      
      if (selection) {
        // Update comment via API
        await lecturerSelectionService.updateSelection(selection.id, {
          comments: editingCandidate.comments
        });
        
        // Reload selected candidates from API
        await loadSelectedCandidates();
      }
      
      setEditingCandidate(null);
      
      toast({
        title: 'Comment Saved',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      
    } catch (error) {
      console.error('Error saving comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save comment. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedApplication(null);
    setCandidateComment('');
  };

  
  return (
    <Flex direction="column" minH="100vh" bg="gray.900">
      <Header />
      
      <Container maxW="container.xl" py={10} flex="1">
        <Center mb={10}>
          <Heading as="h1" size="xl" fontFamily="heading" color="white">
            Lecturer Dashboard
          </Heading>
        </Center>
  
        {/* Tabs for organizing different views */}
        <Tabs variant="enclosed" colorScheme="green" bg="gray.900" rounded="md" p={2}>
          <TabList>
            <Tab _selected={{ color: 'white', bg: 'set.600' }} color="gray.300">All Applications</Tab>
            <Tab _selected={{ color: 'white', bg: 'set.600' }} color="gray.300">Selected Candidates</Tab>
            <Tab _selected={{ color: 'white', bg: 'set.600' }} color="gray.300">Statistics</Tab>
          </TabList>
          
          <TabPanels>
            {/* All Applications Tab */}
            <TabPanel>
              <ApplicationsTab 
                filteredApplications={filteredApplications}
                selectedCandidates={selectedCandidates}
                selectedCourseFilter={selectedCourseFilter}
                setSelectedCourseFilter={setSelectedCourseFilter}
                selectedRoleFilter={selectedRoleFilter}
                setSelectedRoleFilter={setSelectedRoleFilter}
                selectedAvailabilityFilter={selectedAvailabilityFilter}
                setSelectedAvailabilityFilter={setSelectedAvailabilityFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchBy={searchBy}
                setSearchBy={setSearchBy}
                sortBy={sortBy}
                setSortBy={setSortBy}
                sortOrder={sortOrder}
                setSortOrder={setSortOrder}
                viewApplicationDetails={viewApplicationDetails}
                courseMap={courseMap}
              />
            </TabPanel>

            {/* Selected Candidates Tab*/}
            <TabPanel>
              <SelectedCandidatesTab 
                selectedCandidates={selectedCandidates}
                removeCandidate={removeCandidate}
                moveRank={moveRank}
                setEditingCandidate={setEditingCandidate}
                courseMap={courseMap}
                lecturerCourses={lecturerCourses}
              />
            </TabPanel>

            {/* Statistics Tab */}
            <TabPanel>
              <StatisticsTab 
                allApplications={allApplications}
                selectedCandidates={selectedCandidates}
                allLecturerSelections={allLecturerSelections}
                statisticsLoaded={statisticsLoaded}
                courseMap={courseMap}
                lecturerCourses={lecturerCourses}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>


      {/* Application Details Modal */}
      {selectedApplication && (
        <ApplicationDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          application={selectedApplication}
          comment={candidateComment}
          setComment={setCandidateComment}
          onSelect={selectCandidate}
          isUpdate={selectedCandidates.some(c => c.applicationId === selectedApplication.id)}
          courseMap={courseMap}
        />
      )}
      
      {/* Edit Comment Modal */}
      {editingCandidate && (
        <EditCommentModal
          isOpen={!!editingCandidate}
          onClose={() => setEditingCandidate(null)}
          candidate={editingCandidate}
          setCandidate={setEditingCandidate}
          onSave={saveComment}
          courseMap={courseMap}
        />
      )}
  
      <Footer />
    </Flex>
  );  
};

export default LecturerPage;