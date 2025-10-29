// ==============================================================================
// NEW COURSE PAGE - Admin course creation and editing functionality
// ==============================================================================
// This page allows administrators to create new courses or edit existing ones.
// It supports adding/removing modules and updating all course details.
// ==============================================================================

"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";

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
  max-width: 900px;
  margin: 0 auto;
`;

// Header section at the top of the page
const StyledHeader = styled.div`
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

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

// Section container for form groups
const FormSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

// Section title within form sections
const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

// Wrapper for individual form fields
const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Label for form inputs
const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
`;

// Text input field with focus states
const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &:disabled {
    background: #e9ecef;
    cursor: not-allowed;
  }
`;

// Multi-line text input with focus states
const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

// Checkbox input styling
const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
`;

// Label wrapper for checkboxes with flexbox layout
const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
`;

// Card container for each module in the list
const ModuleCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

// Header section of module card with title and remove button
const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

// Module title styling
const ModuleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

// Button component with variant support (primary, secondary, danger)
const Button = styled.button<{ variant?: "primary" | "secondary" | "danger" }>`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

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

// Container for button groups with flexbox layout
const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

// Smaller button for inline actions (e.g., remove module)
const SmallButton = styled.button<{ variant?: "secondary" | "danger" }>`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;

  ${({ variant = "secondary" }) => {
    switch (variant) {
      case "secondary":
        return `
          background: #6c757d;
          color: white;
          &:hover {
            background: #5a6268;
          }
        `;
      case "danger":
        return `
          background: #dc3545;
          color: white;
          &:hover {
            background: #c82333;
          }
        `;
    }
  }}
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

// Loading spinner with animation
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

// ==============================================================================
// TYPESCRIPT INTERFACES
// ==============================================================================

// Module interface - represents a single course module
// id is optional because new modules don't have IDs yet
interface Module {
  id?: string; // Optional - only exists for saved modules
  title: string; // Module title (required)
  moduleNumber: number; // Sequential number for ordering
  description: string; // Module description text
}

// ==============================================================================
// MAIN COMPONENT - Course creation/editing page
// ==============================================================================
export default function NewCoursePage() {
  // ------------------------------------------------------------------------------
  // HOOKS & CONTEXT
  // ------------------------------------------------------------------------------
  const { isExpanded } = useSidebar(); // Sidebar expansion state for layout adjustment
  const router = useRouter(); // Next.js router for navigation
  const searchParams = useSearchParams(); // URL search params to detect edit mode
  const courseId = searchParams.get("id"); // Course ID from URL (null = create mode, value = edit mode)

  // ------------------------------------------------------------------------------
  // STATE MANAGEMENT
  // ------------------------------------------------------------------------------
  
  // Admin verification state
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null = checking, true = admin, false = not admin
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false); // True when submitting form
  const [isFetchingCourse, setIsFetchingCourse] = useState(false); // True when loading existing course data
  
  // Message/notification state for user feedback
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Course form fields
  const [courseName, setCourseName] = useState(""); // Course name input
  const [courseDescription, setCourseDescription] = useState(""); // Course description textarea
  const [coursePrice, setCoursePrice] = useState(""); // Course price (stored as string for input)
  const [isStandalone, setIsStandalone] = useState(true); // Whether course can be purchased individually
  const [modules, setModules] = useState<Module[]>([]); // Array of course modules

  // ------------------------------------------------------------------------------
  // EFFECT HOOKS
  // ------------------------------------------------------------------------------
  
  // Check if current user is an admin
  // Runs once on component mount to verify admin permissions
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        if (res.ok) {
          setIsAdmin(true); // User is admin, allow access
        } else {
          setIsAdmin(false); // Not admin, redirect to dashboard
          router.push("/dashboard");
        }
      } catch (error) {
        setIsAdmin(false); // Error checking, treat as not admin
        router.push("/dashboard");
        console.log(error);
      }
    };
    checkAdmin();
  }, [router]);

  // Fetch existing course data when editing (courseId present in URL)
  // Only runs if courseId exists and user is verified as admin
  useEffect(() => {
    const fetchCourse = async () => {
      // Skip if no courseId (create mode) or admin check not complete
      if (!courseId || !isAdmin) return;
      
      setIsFetchingCourse(true); // Show loading state
      try {
        // Fetch course data from API
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch course");
        }
        
        const data = await res.json();
        
        // Pre-fill all form fields with existing course data
        setCourseName(data.name || "");
        setCourseDescription(data.description || "");
        setCoursePrice(data.price?.toString() || "");
        setIsStandalone(data.isStandalone ?? true);
        // Map modules to include all necessary fields
        setModules(data.modules.map((m: any) => ({
          id: m.id, // Keep existing module IDs for updates
          title: m.title,
          moduleNumber: m.moduleNumber,
          description: m.description || "",
        })));
      } catch (error) {
        console.error("Error fetching course:", error);
        setMessage({ type: "error", text: "Failed to load course data" });
      } finally {
        setIsFetchingCourse(false); // Hide loading state
      }
    };
    
    fetchCourse();
  }, [courseId, isAdmin]); // Re-run if courseId or isAdmin changes

  // ------------------------------------------------------------------------------
  // MODULE MANAGEMENT FUNCTIONS
  // ------------------------------------------------------------------------------
  
  /**
   * Add a new blank module to the modules array
   * Module number is automatically assigned based on current array length
   */
  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "", // Empty title for user to fill in
        moduleNumber: modules.length + 1, // Next sequential number
        description: "", // Empty description
        // No id - will be created when saved to database
      },
    ]);
  };

  /**
   * Remove a module at the specified index
   * Automatically re-numbers remaining modules to maintain sequence
   * @param index - Array index of module to remove
   */
  const removeModule = (index: number) => {
    // Filter out the module at the specified index
    const updatedModules = modules.filter((_, i) => i !== index);
    
    // Re-number all remaining modules sequentially (1, 2, 3, etc.)
    updatedModules.forEach((module, i) => {
      module.moduleNumber = i + 1;
    });
    
    setModules(updatedModules);
  };

  /**
   * Update a specific field of a module
   * @param index - Array index of module to update
   * @param field - Which field to update (title, description, etc.)
   * @param value - New value for the field
   */
  const updateModule = (
    index: number,
    field: keyof Module,
    value: string | number
  ) => {
    // Create a copy of modules array
    const updatedModules = [...modules];
    
    // Update the specific field of the module at index
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value, // Dynamically update the specified field
    };
    
    setModules(updatedModules);
  };

  // ------------------------------------------------------------------------------
  // FORM SUBMISSION HANDLER
  // ------------------------------------------------------------------------------
  
  /**
   * Handle form submission for creating or updating a course
   * Validates all fields, makes API call, and handles response
   * Works for both create (POST) and edit (PUT) modes
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setMessage(null); // Clear any previous messages

    // --------------
    // VALIDATION
    // --------------
    
    // Validate course name is not empty
    if (!courseName.trim()) {
      setMessage({ type: "error", text: "Course name is required" });
      return;
    }

    // Validate price is a valid positive number
    const price = parseFloat(coursePrice);
    if (isNaN(price) || price < 0) {
      setMessage({ type: "error", text: "Please enter a valid price" });
      return;
    }

    // Validate all modules have titles
    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        setMessage({
          type: "error",
          text: `Module ${i + 1} must have a title`,
        });
        return;
      }
    }

    setIsLoading(true); // Show loading state

    try {
      // --------------
      // DETERMINE CREATE VS UPDATE MODE
      // --------------
      
      // If courseId exists, we're updating; otherwise, creating
      const url = courseId 
        ? `/api/admin/courses/${courseId}` // Update existing course
        : "/api/admin/new-course"; // Create new course
      
      const method = courseId ? "PUT" : "POST"; // HTTP method based on mode

      // --------------
      // MAKE API REQUEST
      // --------------
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: courseName.trim(),
          description: courseDescription.trim() || null, // null if empty
          price,
          isStandalone,
          modules: modules.map((module) => ({
            id: module.id, // Include ID for updates (undefined for new modules)
            title: module.title.trim(),
            moduleNumber: module.moduleNumber,
            description: module.description.trim() || null, // null if empty
          })),
        }),
      });

      const data = await response.json();

      // --------------
      // HANDLE RESPONSE
      // --------------
      
      if (response.ok) {
        // Success! Show appropriate message
        setMessage({ 
          type: "success", 
          text: courseId ? "Course updated successfully!" : "Course created successfully!" 
        });
        
        // Reset form only when creating (not when editing)
        if (!courseId) {
          setCourseName("");
          setCourseDescription("");
          setCoursePrice("");
          setIsStandalone(true);
          setModules([]);
        }

        // Redirect to courses list after 2 seconds
        setTimeout(() => {
          router.push("/admin/courses");
        }, 2000);
      } else {
        // API returned an error
        setMessage({
          type: "error",
          text: data.error || `Failed to ${courseId ? 'update' : 'create'} course`,
        });
      }
    } catch (error) {
      // Network or other error occurred
      console.error(`Error ${courseId ? 'updating' : 'creating'} course:`, error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false); // Hide loading state
    }
  };

  // ------------------------------------------------------------------------------
  // RENDER GUARDS - Show loading/error states before main content
  // ------------------------------------------------------------------------------
  
  // Show loading spinner while checking admin status or fetching course data
  if (isAdmin === null || isFetchingCourse) {
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
  // MAIN RENDER - Course creation/editing form
  // ------------------------------------------------------------------------------
  
  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        {/* PAGE HEADER - Changes based on create vs edit mode */}
        <StyledHeader>
          <StyledTitle>
            {courseId ? 'Edit Course Package' : 'Add New Course Package'}
          </StyledTitle>
          <StyledSubtitle>
            {courseId 
              ? 'Modify course details and manage modules'
              : 'Create a new course package with modules for the coaching page'
            }
          </StyledSubtitle>
        </StyledHeader>

        {/* SUCCESS/ERROR MESSAGE DISPLAY */}
        {message && <Alert type={message.type}>{message.text}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* ========================================
              SECTION 1: COURSE INFORMATION
              Basic course details (name, description, price, type)
              ======================================== */}
          <FormSection>
            <SectionTitle>Course Information</SectionTitle>

            {/* Course Name Input (Required) */}
            <FormGroup>
              <Label htmlFor="courseName">Course Name *</Label>
              <Input
                id="courseName"
                type="text"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., Leadership Development Program"
                disabled={isLoading}
                required
              />
            </FormGroup>

            {/* Course Description Textarea (Optional) */}
            <FormGroup>
              <Label htmlFor="courseDescription">Course Description</Label>
              <TextArea
                id="courseDescription"
                value={courseDescription}
                onChange={(e) => setCourseDescription(e.target.value)}
                placeholder="Describe what this course offers..."
                disabled={isLoading}
              />
            </FormGroup>

            {/* Course Price Input (Required, must be positive number) */}
            <FormGroup>
              <Label htmlFor="coursePrice">Price (USD) *</Label>
              <Input
                id="coursePrice"
                type="number"
                step="0.01"
                min="0"
                value={coursePrice}
                onChange={(e) => setCoursePrice(e.target.value)}
                placeholder="99.99"
                disabled={isLoading}
                required
              />
            </FormGroup>

            {/* Standalone Checkbox - determines if course can be purchased alone */}
            <FormGroup>
              <CheckboxLabel>
                <Checkbox
                  type="checkbox"
                  checked={isStandalone}
                  onChange={(e) => setIsStandalone(e.target.checked)}
                  disabled={isLoading}
                />
                Standalone Course (can be purchased individually)
              </CheckboxLabel>
            </FormGroup>
          </FormSection>

          {/* ========================================
              SECTION 2: COURSE MODULES
              Add, remove, and edit course modules
              ======================================== */}
          <FormSection>
            {/* Module Section Header with Add Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <SectionTitle style={{ marginBottom: 0 }}>
                Course Modules ({modules.length})
              </SectionTitle>
              {/* Button to add new module */}
              <Button
                type="button"
                variant="secondary"
                onClick={addModule}
                disabled={isLoading}
              >
                + Add Module
              </Button>
            </div>

            {/* Empty State - Show when no modules exist */}
            {modules.length === 0 ? (
              <p style={{ color: "#6c757d", fontSize: "14px" }}>
                No modules added yet. Click "Add Module" to get started.
              </p>
            ) : (
              /* Module List - Map through all modules and render cards */
              modules.map((module, index) => (
                <ModuleCard key={index}>
                  {/* Module Header - Title and Remove Button */}
                  <ModuleHeader>
                    <ModuleTitle>Module {module.moduleNumber}</ModuleTitle>
                    {/* Remove button for this module */}
                    <SmallButton
                      type="button"
                      variant="danger"
                      onClick={() => removeModule(index)}
                      disabled={isLoading}
                    >
                      Remove
                    </SmallButton>
                  </ModuleHeader>

                  {/* Module Title Input (Required) */}
                  <FormGroup>
                    <Label htmlFor={`module-title-${index}`}>
                      Module Title *
                    </Label>
                    <Input
                      id={`module-title-${index}`}
                      type="text"
                      value={module.title}
                      onChange={(e) =>
                        updateModule(index, "title", e.target.value)
                      }
                      placeholder="e.g., Introduction to Leadership"
                      disabled={isLoading}
                      required
                    />
                  </FormGroup>

                  {/* Module Description Textarea (Optional) */}
                  <FormGroup style={{ marginBottom: 0 }}>
                    <Label htmlFor={`module-description-${index}`}>
                      Module Description
                    </Label>
                    <TextArea
                      id={`module-description-${index}`}
                      value={module.description}
                      onChange={(e) =>
                        updateModule(index, "description", e.target.value)
                      }
                      placeholder="Describe what this module covers..."
                      disabled={isLoading}
                      style={{ minHeight: "80px" }}
                    />
                  </FormGroup>
                </ModuleCard>
              ))
            )}
          </FormSection>

          {/* ========================================
              FORM ACTION BUTTONS
              Cancel and Submit buttons
              ======================================== */}
          <ButtonGroup>
            {/* Cancel Button - Returns to settings page */}
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/settings")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            
            {/* Submit Button - Text changes based on mode (create/update) */}
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading 
                ? (courseId ? "Updating..." : "Creating...") // Loading state
                : (courseId ? "Update Course" : "Create Course") // Default state
              }
            </Button>
          </ButtonGroup>
        </form>
      </StyledContainer>
    </StyledMainContent>
  );
}

// ==============================================================================
// END OF FILE
// ==============================================================================