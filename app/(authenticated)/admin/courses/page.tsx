// ==============================================================================
// ADMIN COURSES PAGE - Course management dashboard for administrators
// ==============================================================================
// This page displays all courses in the system and allows administrators to:
// - View all courses with their details, modules, and enrollments
// - Search/filter courses by name, description, or enrolled users
// - Edit existing courses (redirects to add-new-course page)
// - Delete courses and manage user enrollments
// ==============================================================================

"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";

// ==============================================================================
// STYLED COMPONENTS - UI styling using Emotion
// ==============================================================================

// Main content area that adjusts based on sidebar expansion state
const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 24px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${({ isExpanded }) => (isExpanded ? "256px" : "64px")});
  background: #f8f9fa;
  min-height: 100vh;
`;

// Container to center content with max width
const StyledContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

// Header section at the top with title and action button
const StyledHeader = styled.div`
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Search container with input and results info
const SearchContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Search input field with focus states
const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

// Container for search results info and clear button
const SearchInfo = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #6c757d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

// Button to clear search query
const ClearSearchButton = styled.button`
  background: none;
  border: none;
  color: #667eea;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    text-decoration: underline;
  }
`;

// Container for header text content
const HeaderContent = styled.div``;

// Page title styling
const StyledTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

// Subtitle/description text styling
const StyledSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

// Button component with variant support (primary, secondary, danger)
const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;

  ${({ variant = "primary" }) => {
    switch (variant) {
      case "primary":
        return `
          background: #667eea;
          color: white;
          &:hover:not(:disabled) {
            background: #5568d3;
          }
        `;
      case "secondary":
        return `
          background: #6c757d;
          color: white;
          &:hover:not(:disabled) {
            background: #5a6268;
          }
        `;
      case "danger":
        return `
          background: #dc3545;
          color: white;
          &:hover:not(:disabled) {
            background: #c82333;
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// Grid container for course cards
const CoursesGrid = styled.div`
  display: grid;
  gap: 24px;
`;

// Individual course card with white background
const CourseCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Header section of course card with title and action buttons
const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
`;

// Container for course information (title, description, metadata)
const CourseInfo = styled.div`
  flex: 1;
`;

// Course title styling
const CourseTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

// Course description text
const CourseDescription = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
`;

// Container for course metadata (price, type, module count, enrollments)
const CourseMeta = styled.div`
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #495057;
`;

// Individual metadata item with icon and text
const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

// Container for action buttons (Edit, Delete)
const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

// Icon button for course actions (Edit, Delete) with variant support
const IconButton = styled.button<{ variant?: "primary" | "danger" }>`
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;

  ${({ variant = "primary" }) => {
    if (variant === "danger") {
      return `
        background: #dc3545;
        color: white;
        &:hover {
          background: #c82333;
        }
      `;
    }
    return `
      background: #667eea;
      color: white;
      &:hover {
        background: #5568d3;
      }
    `;
  }}
`;

// Section displaying course modules list
const ModulesSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

// Title for modules and enrollments sections
const ModulesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
`;

// Container for list of modules
const ModulesList = styled.div`
  display: grid;
  gap: 8px;
`;

// Individual module item display
const ModuleItem = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
`;

// Section displaying enrolled users
const EnrollmentsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

// Scrollable container for enrollment list
const EnrollmentsList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

// Individual enrollment item with user info and remove button
const EnrollmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
`;

// User information display (name and email)
const UserInfo = styled.div`
  font-size: 14px;
  color: #495057;
`;

// Small button for removing enrollments
const SmallButton = styled.button`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }
`;

// Animated loading spinner
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  &::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 3px solid #e9ecef;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Alert/message box for success and error messages
const Alert = styled.div<{ type: "success" | "error" }>`
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;

  ${({ type }) =>
    type === "success"
      ? `
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
  `
      : `
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
  `}
`;

// Empty state message when no courses exist or match search
const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

// Modal overlay for delete confirmation
const Modal = styled.div<{ show: boolean }>`
  display: ${({ show }) => (show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

// Modal content container with white background
const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

// Modal title styling
const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

// Modal description text
const ModalText = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 24px;
`;

// Container for modal action buttons
const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

// ==============================================================================
// TYPESCRIPT INTERFACES - Data type definitions
// ==============================================================================

// Module interface - represents a single course module
interface Module {
  id: string; // Unique module identifier
  title: string; // Module title
  moduleNumber: number | null; // Sequential number for ordering
  description: string | null; // Module description (optional)
}

// Enrollment interface - represents a user enrolled in a course
interface Enrollment {
  userId: string; // ID of the enrolled user
  user: {
    id: string; // User's unique identifier
    name: string | null; // User's display name (optional)
    email: string; // User's email address
  };
}

// Course interface - represents a complete course with modules and enrollments
interface Course {
  id: string; // Unique course identifier
  name: string; // Course name/title
  description: string | null; // Course description (optional)
  price: number; // Course price in USD
  isStandalone: boolean; // Whether course can be purchased individually
  createdAt: string; // ISO date string of course creation
  modules: Module[]; // Array of course modules
  enrollments: Enrollment[]; // Array of enrolled users
}

// ==============================================================================
// MAIN COMPONENT - Admin courses management page
// ==============================================================================
export default function AdminCoursesPage() {
  // ------------------------------------------------------------------------------
  // HOOKS & CONTEXT
  // ------------------------------------------------------------------------------
  const { isExpanded } = useSidebar(); // Sidebar expansion state for layout adjustment
  const router = useRouter(); // Next.js router for navigation

  // ------------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------------------------------------------
  
  // Admin verification state (null = checking, true = admin, false = not admin)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  
  // Courses data array fetched from API
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Search query input for filtering courses
  const [searchQuery, setSearchQuery] = useState("");
  
  // Loading state while fetching courses
  const [isLoading, setIsLoading] = useState(true);
  
  // Success/error message state for user feedback
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  
  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean; // Whether modal is visible
    courseId: string | null; // ID of course to delete
    courseName: string; // Name of course to display in modal
  }>({
    show: false,
    courseId: null,
    courseName: "",
  });

  // ------------------------------------------------------------------------------
  // EFFECT HOOKS
  // ------------------------------------------------------------------------------
  
  /**
   * Check if current user is an admin
   * Runs once on component mount to verify admin permissions
   * Redirects non-admin users to dashboard
   */
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      } catch (error) {
        setIsAdmin(false);
        router.push("/dashboard");
        console.log(error);
      }
    };
    checkAdmin();
  }, [router]);

  // ------------------------------------------------------------------------------
  // DATA FETCHING FUNCTIONS
  // ------------------------------------------------------------------------------
  
  /**
   * Fetch all courses from the API
   * Retrieves courses with modules and enrollment information
   * Sets loading state and handles errors
   */
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/courses");
      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setMessage({ type: "error", text: "Failed to load courses" });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Trigger course fetching when admin status is confirmed
   * Runs whenever isAdmin state changes
   */
  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  // ------------------------------------------------------------------------------
  // SEARCH & FILTERING
  // ------------------------------------------------------------------------------
  
  /**
   * Filter courses based on search query
   * Searches across: course name, description, enrolled user names/emails
   * Returns all courses if search query is empty
   */
  const filteredCourses = courses.filter((course) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search by course name
    if (course.name.toLowerCase().includes(query)) return true;
    
    // Search by course description
    if (course.description?.toLowerCase().includes(query)) return true;
    
    // Search by enrolled user name or email
    const hasMatchingUser = course.enrollments.some(
      (enrollment) =>
        enrollment.user.name?.toLowerCase().includes(query) ||
        enrollment.user.email.toLowerCase().includes(query)
    );
    
    return hasMatchingUser;
  });

  // ------------------------------------------------------------------------------
  // ACTION HANDLERS
  // ------------------------------------------------------------------------------
  
  /**
   * Handle course deletion
   * Shows confirmation modal before deleting
   * Refreshes course list after successful deletion
   */
  const handleDeleteCourse = async () => {
    if (!deleteModal.courseId) return;

    try {
      const res = await fetch(`/api/admin/courses/${deleteModal.courseId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Course deleted successfully" });
        setDeleteModal({ show: false, courseId: null, courseName: "" });
        fetchCourses();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to delete course" });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  /**
   * Handle removing a user from a course
   * @param courseId - ID of the course
   * @param userId - ID of the user to remove
   * Refreshes course list after successful removal
   */
  const handleRemoveEnrollment = async (courseId: string, userId: string) => {
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/enrollments`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "User removed from course" });
        fetchCourses();
      } else {
        const data = await res.json();
        setMessage({ type: "error", text: data.error || "Failed to remove user" });
      }
    } catch (error) {
      console.error("Error removing enrollment:", error);
      setMessage({ type: "error", text: "An error occurred" });
    }
  };

  // ------------------------------------------------------------------------------
  // RENDER GUARDS - Show loading/error states before main content
  // ------------------------------------------------------------------------------
  
  // Show loading spinner while checking admin status or fetching courses
  if (isAdmin === null || isLoading) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <LoadingSpinner />
      </StyledMainContent>
    );
  }

  // Show access denied if user is not an admin
  if (isAdmin === false) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <Alert type="error">Access Denied</Alert>
      </StyledMainContent>
    );
  }

  // ------------------------------------------------------------------------------
  // MAIN RENDER - Course management dashboard
  // ------------------------------------------------------------------------------
  
  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        {/* PAGE HEADER - Title, description, and add new course button */}
        <StyledHeader>
          <HeaderContent>
            <StyledTitle>Course Management</StyledTitle>
            <StyledSubtitle>
              Manage courses, modules, and enrollments
            </StyledSubtitle>
          </HeaderContent>
          {/* Button to navigate to add-new-course page */}
          <Button variant="primary" onClick={() => router.push("/admin/add-new-course")}>
            <AddIcon fontSize="small" />
            Add New Course
          </Button>
        </StyledHeader>
        
        {/* SEARCH SECTION - Filter courses by name, description, or users */}
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by course name, description, or enrolled user name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Show search results info and clear button when searching */}
          {searchQuery && (
            <SearchInfo>
              <span>
                Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </span>
              <ClearSearchButton onClick={() => setSearchQuery("")}>
                Clear search
              </ClearSearchButton>
            </SearchInfo>
          )}
        </SearchContainer>
        
        {/* SUCCESS/ERROR MESSAGE DISPLAY */}
        {message && <Alert type={message.type}>{message.text}</Alert>}

        {/* CONDITIONAL RENDERING: Empty state or courses grid */}
        {filteredCourses.length === 0 ? (
          // Empty state when no courses found
          <EmptyState>
            {/* Show different messages based on whether user is searching */}
            {searchQuery ? (
              // No search results found
              <>
                <p>No courses found matching &quot;{searchQuery}&quot;</p>
                <Button
                  variant="secondary"
                  onClick={() => setSearchQuery("")}
                  style={{ marginTop: "16px" }}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              // No courses exist at all
              <>
                <p>No courses found</p>
                <Button
                  variant="primary"
                  onClick={() => router.push("/admin/add-new-course")}
                  style={{ marginTop: "16px" }}
                >
                  <AddIcon fontSize="small" />
                  Add Your First Course
                </Button>
              </>
            )}
          </EmptyState>
        ) : (
          // Display grid of course cards
          <CoursesGrid>
            {/* Map through filtered courses and render a card for each */}
            {filteredCourses.map((course) => (
              <CourseCard key={course.id}>
                {/* COURSE HEADER - Title, description, metadata, and action buttons */}
                <CourseHeader>
                  <CourseInfo>
                    <CourseTitle>{course.name}</CourseTitle>
                    {course.description && (
                      <CourseDescription>{course.description}</CourseDescription>
                    )}
                    {/* Course metadata: price, type, module count, enrollments */}
                    <CourseMeta>
                      <MetaItem>
                        <strong>Price:</strong> ${course.price}
                      </MetaItem>
                      <MetaItem>
                        <strong>Type:</strong> {course.isStandalone ? "Standalone" : "Bundle"}
                      </MetaItem>
                      <MetaItem>
                        <strong>Modules:</strong> {course.modules.length}
                      </MetaItem>
                      <MetaItem>
                        <PeopleIcon fontSize="small" />
                        {course.enrollments.length}
                      </MetaItem>
                    </CourseMeta>
                  </CourseInfo>
                  {/* Action buttons for editing and deleting course */}
                  <ButtonGroup>
                    {/* Edit button - navigates to add-new-course page with course ID */}
                    <IconButton
                      variant="primary"
                      onClick={() => router.push(`/admin/add-new-course?id=${course.id}`)}
                    >
                      Edit
                    </IconButton>
                    {/* Delete button - opens confirmation modal */}
                    <IconButton
                      variant="danger"
                      onClick={() =>
                        setDeleteModal({
                          show: true,
                          courseId: course.id,
                          courseName: course.name,
                        })
                      }
                    >
                      <DeleteIcon fontSize="small" />
                      Delete
                    </IconButton>
                  </ButtonGroup>
                </CourseHeader>

                {/* MODULES SECTION - Display list of course modules */}
                <ModulesSection>
                  <ModulesTitle>Modules ({course.modules.length})</ModulesTitle>
                  {course.modules.length > 0 ? (
                    // Display modules sorted by module number
                    <ModulesList>
                      {course.modules
                        .sort((a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0))
                        .map((module) => (
                          <ModuleItem key={module.id}>
                            <strong>Module {module.moduleNumber}:</strong> {module.title}
                          </ModuleItem>
                        ))}
                    </ModulesList>
                  ) : (
                    // Show empty state if no modules
                    <EmptyState style={{ padding: "20px" }}>No modules</EmptyState>
                  )}
                </ModulesSection>

                {/* ENROLLMENTS SECTION - Display enrolled users with remove option */}
                <EnrollmentsSection>
                  <ModulesTitle>
                    Enrolled Users ({course.enrollments.length})
                  </ModulesTitle>
                  {course.enrollments.length > 0 ? (
                    // Display list of enrolled users
                    <EnrollmentsList>
                      {course.enrollments.map((enrollment) => (
                        <EnrollmentItem key={enrollment.userId}>
                          <UserInfo>
                            {enrollment.user.name || "Unknown User"} ({enrollment.user.email})
                          </UserInfo>
                          {/* Remove button to unenroll user */}
                          <SmallButton
                            onClick={() =>
                              handleRemoveEnrollment(course.id, enrollment.userId)
                            }
                          >
                            Remove
                          </SmallButton>
                        </EnrollmentItem>
                      ))}
                    </EnrollmentsList>
                  ) : (
                    // Show empty state if no enrollments
                    <EmptyState style={{ padding: "20px" }}>No enrollments</EmptyState>
                  )}
                </EnrollmentsSection>
              </CourseCard>
            ))}
          </CoursesGrid>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        <Modal show={deleteModal.show} onClick={() => setDeleteModal({ show: false, courseId: null, courseName: "" })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Course</ModalTitle>
            <ModalText>
              Are you sure you want to delete "{deleteModal.courseName}"? This action cannot be undone and will remove all associated modules and enrollments.
            </ModalText>
            {/* Modal action buttons */}
            <ModalButtons>
              <Button
                variant="secondary"
                onClick={() => setDeleteModal({ show: false, courseId: null, courseName: "" })}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteCourse}>
                Delete Course
              </Button>
            </ModalButtons>
          </ModalContent>
        </Modal>
      </StyledContainer>
    </StyledMainContent>
  );
}

// ==============================================================================
// END OF FILE
// ==============================================================================