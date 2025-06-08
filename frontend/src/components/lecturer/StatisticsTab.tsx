import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Text, Badge, VStack, StatGroup, Stat, StatLabel,
  StatNumber, StatHelpText, SimpleGrid, Card, CardBody, List,
  ListItem, ListIcon, Center,
} from '@chakra-ui/react';
import { CheckCircleIcon, WarningIcon } from '@chakra-ui/icons';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

import { TutorApplication, SelectedCandidate } from '../../types/tutor';

interface Course {
  id: number;
  code: string;
  title: string;
  roleType: string;
}

type StatisticsTabProps = {
  allApplications: TutorApplication[];
  selectedCandidates: SelectedCandidate[];
  allLecturerSelections: { [key: string]: SelectedCandidate[] };
  statisticsLoaded: boolean;
  courseMap: { [key: string]: string };
  lecturerCourses: Course[];
};

type SelectionCount = {
  count: number;
  application: TutorApplication | null;
};

type StatisticsState = {
  mostChosen: (TutorApplication | null)[];
  mostChosenCount: number;
  leastChosen: (TutorApplication | null)[];
  leastChosenCount: number;
  notSelected: TutorApplication[];
  totalSelections: number;
  selectionCounts: { [key: string]: SelectionCount };
};

const StatisticsTab = ({
  allApplications,
  selectedCandidates,
  allLecturerSelections,
  statisticsLoaded,
  courseMap,
  lecturerCourses,
}: StatisticsTabProps) => {
  // useState to store calculated statistics
  const [statistics, setStatistics] = useState<StatisticsState>({
    mostChosen: [],
    mostChosenCount: 0,
    leastChosen: [],
    leastChosenCount: 0,
    notSelected: [],
    totalSelections: 0,
    selectionCounts: {},
  });

  // useEffect to calculate statistics when dependencies change
  useEffect(() => {
    // Skip calculations if data isn't loaded yet
    if (!statisticsLoaded) {
      return;
    }

    // Filter applications and selections to only include lecturer's assigned courses
    const assignedCourseCodes = lecturerCourses.map(course => course.code);
    
    // Filter all applications to only include those for assigned courses
    const filteredApplications = allApplications.filter(app => 
      assignedCourseCodes.includes(app.selectedCourse)
    );

    // Filter lecturer selections to only include selections for assigned courses
    const filteredLecturerSelections: { [key: string]: SelectedCandidate[] } = {};
    Object.entries(allLecturerSelections).forEach(([lecturerId, selections]) => {
      filteredLecturerSelections[lecturerId] = selections.filter(candidate => 
        assignedCourseCodes.includes(candidate.course)
      );
    });

    // calculates selection counts for each application
    const selectionCounts: { [key: string]: SelectionCount } = {};

    // count selections for each application across all lecturers (filtered)
    Object.values(filteredLecturerSelections).forEach((selections) => {
      selections.forEach((candidate) => {
        if (!selectionCounts[candidate.applicationId]) {
          selectionCounts[candidate.applicationId] = {
            count: 0,
            application: filteredApplications.find((app) => app.id === candidate.applicationId) || null,
          };
        }
        selectionCounts[candidate.applicationId].count += 1;
      });
    });

    // sort applications by selection count
    const selectedApplications = Object.entries(selectionCounts)
      .filter(([_, data]) => data.application !== null)
      .sort((a, b) => b[1].count - a[1].count);

    // find the most chosen applications
    let mostChosenCount = 0;
    let mostChosen: (TutorApplication | null)[] = [];

    if (selectedApplications.length > 0) {
      mostChosenCount = selectedApplications[0][1].count;
      mostChosen = selectedApplications
        .filter(([_, data]) => data.count === mostChosenCount)
        .map(([_, data]) => data.application);
    }

    // find the least chosen applications
    let leastChosenCount = 0;
    let leastChosen: (TutorApplication | null)[] = [];

    if (selectedApplications.length > 0) {
      leastChosenCount = selectedApplications[selectedApplications.length - 1][1].count;
      leastChosen = selectedApplications
        .filter(([_, data]) => data.count === leastChosenCount)
        .map(([_, data]) => data.application);
    }

    // find applications not selected by any lecturer (from filtered applications)
    const selectedIds = new Set<string>(Object.keys(selectionCounts));
    const notSelected = filteredApplications.filter((app) => !selectedIds.has(app.id));

    // calculate total unique selections across all lecturers (from filtered selections)
    const uniqueIds = new Set<string>();
    Object.values(filteredLecturerSelections).forEach((selections) => {
      selections.forEach((s) => uniqueIds.add(s.applicationId));
    });

    // update state with calculated statistics
    setStatistics({
      mostChosen,
      mostChosenCount,
      leastChosen,
      leastChosenCount,
      notSelected,
      totalSelections: uniqueIds.size,
      selectionCounts,
    });
  }, [allApplications, allLecturerSelections, statisticsLoaded, lecturerCourses]);

  // If statistics aren't loaded yet, show loading message
  if (!statisticsLoaded) {
    return (
      <Box bg="gray.900" p={6} rounded="md" shadow="lg" color="white" borderColor="set.700" borderWidth="1px" mb={10}>
        <Heading as="h2" size="lg" mb={6}>Application Statistics</Heading>
        <Center p={10}><Text>Loading statistics...</Text></Center>
      </Box>
    );
  }

  // If no courses assigned or no applications for assigned courses, show appropriate message
  if (lecturerCourses.length === 0 || allApplications.length === 0) {
    return (
      <Box bg="gray.900" p={6} rounded="md" shadow="lg" color="white" borderColor="set.700" borderWidth="1px" mb={10}>
        <Heading as="h2" size="lg" mb={6}>Application Statistics</Heading>
        <Center p={10}>
          <VStack spacing={4}>
            <WarningIcon boxSize={12} color="yellow.400" />
            <Text fontSize="lg" color="gray.300" textAlign="center">
              No statistics available
            </Text>
            <Text color="gray.500" textAlign="center">
              You have not been assigned to any courses yet. Contact an administrator to get access to courses and view application statistics.
            </Text>
          </VStack>
        </Center>
      </Box>
    );
  }


  const {
    mostChosen,
    mostChosenCount,
    leastChosen,
    leastChosenCount,
    notSelected,
    totalSelections,
    selectionCounts,
  } = statistics;

  // Filter selected candidates to only include those for assigned courses
  const assignedCourseCodes = lecturerCourses.map(course => course.code);
  const filteredSelectedCandidates = selectedCandidates.filter(candidate => 
    assignedCourseCodes.includes(candidate.course)
  );

  const barChartData = Object.values(selectionCounts).map(({ application, count }) => ({
    name: application?.name || 'Unknown',
    count,
  }));

  const pieData = [
    { name: 'Selected', value: allApplications.length - notSelected.length },
    { name: 'Unselected', value: notSelected.length },
  ];

  const pieColors = ['#48BB78', '#F56565'];

  return (
    <Box bg="gray.900" p={6} rounded="md" shadow="lg" color="white" borderColor="set.700" borderWidth="1px" mb={10}>
      <Heading as="h2" size="lg" mb={6}>Application Statistics</Heading>

      <VStack spacing={8} align="stretch">
        {/* Summary Stats */}
        <StatGroup bg="gray.800" p={5} borderRadius="md" borderWidth="1px" borderColor="set.700">
          <Stat>
            <StatLabel>Total Applications</StatLabel>
            <StatNumber>{allApplications.length}</StatNumber>
            <StatHelpText>For your assigned courses</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Selected by You</StatLabel>
            <StatNumber>{filteredSelectedCandidates.length}</StatNumber>
            <StatHelpText>Candidates you've chosen</StatHelpText>
          </Stat>

          <Stat>
            <StatLabel>Total Selections</StatLabel>
            <StatNumber>{totalSelections}</StatNumber>
            <StatHelpText>By all lecturers for your courses</StatHelpText>
          </Stat>
        </StatGroup>

        {/* Charts */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          <Card bg="gray.800" borderWidth="1px" borderColor="set.700">
            <CardBody>
              <Heading size="md" mb={4} color="cyan.300">Selection Count by Applicant</Heading>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} tickCount={statistics.mostChosenCount + 1} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#38B2AC" />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          <Card bg="gray.800" borderWidth="1px" borderColor="set.700">
            <CardBody>
              <Heading size="md" mb={4} color="pink.300">Selected vs Unselected Applicants</Heading>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Lists for Most/Least/Unselected */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
          {/* Most Chosen */}
          <Card bg="gray.800" borderWidth="1px" borderColor="set.700">
            <CardBody>
              <Heading size="md" mb={3} color="green.400">
                Most Selected Applicants
                {mostChosenCount > 0 && <Badge ml={2} colorScheme="green">{mostChosenCount} selections</Badge>}
              </Heading>
              {mostChosen.length === 0 ? (
                <Text color="gray.400">No selections have been made yet.</Text>
              ) : (
                <List spacing={2}>
                  {mostChosen.map((app) => app && (
                    <ListItem key={app.id} display="flex" alignItems="center">
                      <ListIcon as={CheckCircleIcon} color="green.500" />
                      <Box>
                        <Text fontWeight="bold">{app.name}</Text>
                        <Text fontSize="sm" color="gray.400">{app.email}</Text>
                        <Text fontSize="sm">
                          <Badge colorScheme="purple" mr={2}>{app.selectedCourse}</Badge>
                          <Badge colorScheme={app.availability === 'full-time' ? 'green' : 'blue'}>
                            {app.availability === 'full-time' ? 'Full Time' : 'Part Time'}
                          </Badge>
                        </Text>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>

          {/* Least Chosen */}
          <Card bg="gray.800" borderWidth="1px" borderColor="set.700">
            <CardBody>
              <Heading size="md" mb={3} color="yellow.400">
                Least Selected Applicants
                {leastChosenCount > 0 && <Badge ml={2} colorScheme="yellow">{leastChosenCount} selection(s)</Badge>}
              </Heading>
              {leastChosen.length === 0 ? (
                <Text color="gray.400">No selections have been made yet.</Text>
              ) : (
                <List spacing={2}>
                  {leastChosen.map((app) => app && (
                    <ListItem key={app.id} display="flex" alignItems="center">
                      <ListIcon as={WarningIcon} color="yellow.500" />
                      <Box>
                        <Text fontWeight="bold">{app.name}</Text>
                        <Text fontSize="sm" color="gray.400">{app.email}</Text>
                        <Text fontSize="sm">
                          <Badge colorScheme="purple" mr={2}>{app.selectedCourse}</Badge>
                          <Badge colorScheme={app.availability === 'full-time' ? 'green' : 'blue'}>
                            {app.availability === 'full-time' ? 'Full Time' : 'Part Time'}
                          </Badge>
                        </Text>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg="gray.800" borderWidth="1px" borderColor="set.700">
          <CardBody>
            <Heading size="md" mb={3} color="red.400">
              Applicants Not Selected by Any Lecturer
            </Heading>
            {notSelected.length === 0 ? (
              <Text color="gray.400">All applicants have been selected by at least one lecturer.</Text>
            ) : (
              <List spacing={2}>
                {notSelected.map((app) => (
                  <ListItem key={app.id} display="flex" alignItems="center">
                    <ListIcon as={WarningIcon} color="red.500" />
                    <Box>
                      <Text fontWeight="bold">{app.name}</Text>
                      <Text fontSize="sm" color="gray.400">{app.email}</Text>
                      <Text fontSize="sm">
                        <Badge colorScheme="purple" mr={2}>{app.selectedCourse}</Badge>
                        <Badge colorScheme={app.availability === 'full-time' ? 'green' : 'blue'}>
                          {app.availability === 'full-time' ? 'Full Time' : 'Part Time'}
                        </Badge>
                      </Text>
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default StatisticsTab;
