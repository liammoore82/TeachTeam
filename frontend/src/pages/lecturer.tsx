import { useEffect, useState } from 'react';
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
  
  // Helper function to generate a unique localStorage key for user selections,
  // ensures each lecturer's selections are stored separately
  const getUserSelectionsKey = (): string => {
    return 'selectedTutorCandidates_' + (userEmail || 'anonymous');
  };
  
  
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
    loadTutorApplications();
  }, [signedIn, userRole, router]); 

  // Load selected candidates when userEmail or applications change
  
  useEffect(() => {
    if (userEmail) {
      loadSelectedCandidates();
    }
  }, [userEmail, allApplications]);
  
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

  // Load applications from localStorage
  
  const loadTutorApplications = (): void => {
    const applications: TutorApplication[] = [];
    
    // Check localStorage for applications
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('tutorApplicationData')) {
        try {
          const applicationData = localStorage.getItem(key);
          if (applicationData) {
            // Parse stored JSON data
            const parsedApplication = JSON.parse(applicationData);
            let email = 'applicant@example.com';
            
            // Extract email from key name - handle new format with course and role
            const keyParts = key.split('_');
            if (keyParts.length >= 4) {
              // New format: tutorApplicationData_COURSE_ROLE_EMAIL
              email = keyParts[keyParts.length - 1];
            } else if (key.includes('_')) {
              // Old format: tutorApplicationData_EMAIL
              email = key.substring(key.indexOf('_') + 1);
            }
            
            // Create application object from stored data
            const appObject: TutorApplication = {
              id: key,
              name: parsedApplication.name || email.split('@')[0].replace('.', ' '),
              selectedCourse: parsedApplication.selectedCourse,
              selectedRole: parsedApplication.selectedRole || 'tutor', // Default to tutor for backward compatibility
              availability: parsedApplication.availability,
              skills: parsedApplication.skills,
              credentials: parsedApplication.credentials,
              previousRoles: parsedApplication.previousRoles,
              email: email,
              timestamp: parsedApplication.timestamp || new Date().toISOString()
            };
            
            applications.push(appObject);
          }
        } catch (error) {
          console.error('Error parsing stored application:', error);
        }
      }
    }
    
    // Add mock data if no applications found
    
    if (applications.length === 0) {
      applications.push(
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
          timestamp: '2025-03-15T10:30:00Z'
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
          timestamp: '2025-03-18T14:20:00Z'
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
          timestamp: '2025-03-20T09:15:00Z'
        }
      );
    }
    
    // Sort applications by timestamp (newest first)
    applications.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
    
    // Update state with loaded applications
    setAllApplications(applications);
    setFilteredApplications(applications);
  };

  // Load statistics for all lecturer selections
  
  const loadAllLecturerSelections = (): void => {
    const selections: {[key: string]: SelectedCandidate[]} = {};
    
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('selectedTutorCandidates_')) {
        try {
          const savedCandidates = localStorage.getItem(key);
          if (savedCandidates) {
            selections[key] = JSON.parse(savedCandidates);
          }
        } catch (error) {
          console.error('Error loading selections for statistics:', error);
        }
      }
    }
    
    
    setAllLecturerSelections(selections);
    setStatisticsLoaded(true);
  };

  // Load previously selected candidates from localStorage
  
  const loadSelectedCandidates = (): void => {
    // Get the localStorage key for the current user
    const storageKey = getUserSelectionsKey();
    const savedCandidates = localStorage.getItem(storageKey);
    
    if (savedCandidates) {
      
        const parsed = JSON.parse(savedCandidates);
        
        
        const updatedCandidates = parsed.map((candidate: SelectedCandidate) => {
          if (candidate.name) return candidate;
          
          
          const application = allApplications.find(app => app.id === candidate.applicationId);
          return {
            ...candidate,
            name: application ? application.name : 'Unknown'
          };
        });
        
        setSelectedCandidates(updatedCandidates);
       
    } else {
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
  
  const selectCandidate = (): void => {
    if (!selectedApplication) return;
    
    // Check if candidate already exists
    const existingIndex = selectedCandidates.findIndex(
      c => c.applicationId === selectedApplication.id
    );
    
    // Create the candidate object
    const newCandidate: SelectedCandidate = {
      applicationId: selectedApplication.id,
      name: selectedApplication.name,
      email: selectedApplication.email,
      course: selectedApplication.selectedCourse,
      role: selectedApplication.selectedRole, // Include role in selected candidate
      rank: existingIndex >= 0 ? selectedCandidates[existingIndex].rank : selectedCandidates.length + 1,
      comments: candidateComment
    };
    
    // Update the selected candidates list
    
    let updatedCandidates: SelectedCandidate[];
    if (existingIndex >= 0) {
      updatedCandidates = [...selectedCandidates];
      updatedCandidates[existingIndex] = newCandidate;
    } else {
      updatedCandidates = [...selectedCandidates, newCandidate];
    }
    
    
    setSelectedCandidates(updatedCandidates);
    localStorage.setItem(getUserSelectionsKey(), JSON.stringify(updatedCandidates));
    
    
    loadAllLecturerSelections();
    
    
    toast({
      title: existingIndex >= 0 ? 'Candidate Updated' : 'Candidate Selected',
      description: `${selectedApplication.name} has been ${existingIndex >= 0 ? 'updated' : 'added to selected candidates'}.`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
    
    // Close the modal
    setIsModalOpen(false);
  };

  // Handler for removing a candidate
  
  const removeCandidate = (applicationId: string): void => {
    // Filter out the candidate to remove and re-rank remaining candidates
    const updatedCandidates = selectedCandidates
      .filter(candidate => candidate.applicationId !== applicationId)
      .sort((a, b) => a.rank - b.rank)
      .map((candidate, index) => ({...candidate, rank: index + 1}));
    
    // Update state and save to localStorage
    setSelectedCandidates(updatedCandidates);
    localStorage.setItem(getUserSelectionsKey(), JSON.stringify(updatedCandidates));
    
    // Refresh statistics after removal
    loadAllLecturerSelections();
    
    
    toast({
      title: 'Candidate Removed',
      description: 'The candidate has been removed from your selection.',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  // Handler for changing candidate rank order
  
  const moveRank = (applicationId: string, direction: 'up' | 'down'): void => {
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
    const otherCandidateIndex = selectedCandidates.findIndex(c => c.rank === newRank);
    
    if (otherCandidateIndex === -1) return;
    
    
    const updatedCandidates = [...selectedCandidates];
    updatedCandidates[candidateIndex] = { ...candidate, rank: newRank };
    updatedCandidates[otherCandidateIndex] = { 
      ...updatedCandidates[otherCandidateIndex], 
      rank: candidate.rank 
    };
    
    // Sort by rank
    updatedCandidates.sort((a, b) => a.rank - b.rank);
    
    // Update state and save to localStorage
    setSelectedCandidates(updatedCandidates);
    localStorage.setItem(getUserSelectionsKey(), JSON.stringify(updatedCandidates));
  };

  // Handler for saving candidate comments
  
  const saveComment = (): void => {
    if (!editingCandidate) return;
    
    // Update comment for the candidate
    
    const updatedCandidates = selectedCandidates.map(candidate => 
      candidate.applicationId === editingCandidate.applicationId
        ? { ...candidate, comments: editingCandidate.comments }
        : candidate
    );
    
    // Update state and save to localStorage
    setSelectedCandidates(updatedCandidates);
    localStorage.setItem(getUserSelectionsKey(), JSON.stringify(updatedCandidates));
    
    
    setEditingCandidate(null);
    
    
    toast({
      title: 'Comment Saved',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
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