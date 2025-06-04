import { render, screen, fireEvent } from '@testing-library/react';
import EditCommentModal from '../../src/components/lecturer/EditCommentModal';
import { SelectedCandidate } from '../../src/types/tutor';

// Mock the courseMap object
const mockCourseMap = {
  'COSC1822': 'Full Stack Development - Tutor',
  'COSC8288': 'Programming Studio 2 - Tutor',
};

// Create a mock candidate for testing
const mockCandidate: SelectedCandidate = {
  applicationId: 'app123',
  name: 'Jane Smith',
  email: 'jane.smith@example.com',
  course: 'COSC1822',
  rank: 2,
  comments: 'Initial comment'
};

describe('EditCommentModal', () => {
  // Mock functions
  const mockOnClose = jest.fn();
  const mockSetCandidate = jest.fn();
  const mockOnSave = jest.fn();

  // Reset mock functions before each test
  beforeEach(() => {
    mockOnClose.mockReset();
    mockSetCandidate.mockReset();
    mockOnSave.mockReset();
  });

  test('renders the modal with candidate information when open', () => {
    render(
      <EditCommentModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        setCandidate={mockSetCandidate}
        onSave={mockOnSave}
        courseMap={mockCourseMap}
      />
    );

    // Check if candidate info is displayed
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Course: COSC1822 - Full Stack Development - Tutor/)).toBeInTheDocument();
    expect(screen.getByText('Rank: 2')).toBeInTheDocument();
    
    // Check if textarea has correct initial value
    const textarea = screen.getByPlaceholderText('Add your comments about this candidate...');
    expect(textarea).toHaveValue('Initial comment');
    
    // Check if buttons are present
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save Comment')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(
      <EditCommentModal
        isOpen={false}
        onClose={mockOnClose}
        candidate={mockCandidate}
        setCandidate={mockSetCandidate}
        onSave={mockOnSave}
        courseMap={mockCourseMap}
      />
    );

    // Modal should not be in the document when isOpen is false
    expect(screen.queryByText('Edit Comments')).not.toBeInTheDocument();
  });

  test('calls setCandidate when textarea value changes', () => {
    render(
      <EditCommentModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        setCandidate={mockSetCandidate}
        onSave={mockOnSave}
        courseMap={mockCourseMap}
      />
    );

    // Find textarea and update its value
    const textarea = screen.getByPlaceholderText('Add your comments about this candidate...');
    fireEvent.change(textarea, { target: { value: 'New comment text' } });

    // Check if setCandidate was called with updated candidate object
    expect(mockSetCandidate).toHaveBeenCalledWith({
      ...mockCandidate,
      comments: 'New comment text'
    });
  });

  test('calls onClose when Cancel button is clicked', () => {
    render(
      <EditCommentModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        setCandidate={mockSetCandidate}
        onSave={mockOnSave}
        courseMap={mockCourseMap}
      />
    );

    // Find and click Cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  test('calls onSave when Save Comment button is clicked', () => {
    render(
      <EditCommentModal
        isOpen={true}
        onClose={mockOnClose}
        candidate={mockCandidate}
        setCandidate={mockSetCandidate}
        onSave={mockOnSave}
        courseMap={mockCourseMap}
      />
    );

    // Find and click Save Comment button
    const saveButton = screen.getByText('Save Comment');
    fireEvent.click(saveButton);

    // Check if onSave was called
    expect(mockOnSave).toHaveBeenCalledTimes(1);
  });
});