"use client";
// Force recompile
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import PeopleIcon from "@mui/icons-material/People";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 24px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${({ isExpanded }) => (isExpanded ? "256px" : "64px")});
  background: #f8f9fa;
  min-height: 100vh;
`;

const StyledContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

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
const SearchContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

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

const SearchInfo = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: #6c757d;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

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
const HeaderContent = styled.div``;

const StyledTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const StyledSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

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

const CoursesGrid = styled.div`
  display: grid;
  gap: 24px;
`;

const CourseCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CourseHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 16px;
`;

const CourseInfo = styled.div`
  flex: 1;
`;

const CourseTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const CourseDescription = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 12px;
`;

const CourseMeta = styled.div`
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #495057;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

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

const ModulesSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const ModulesTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
`;

const ModulesList = styled.div`
  display: grid;
  gap: 8px;
`;

const ModuleItem = styled.div`
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #495057;
`;

const EnrollmentsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
`;

const EnrollmentsList = styled.div`
  display: grid;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
`;

const EnrollmentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
`;

const UserInfo = styled.div`
  font-size: 14px;
  color: #495057;
`;

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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

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

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  padding: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const ModalText = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 24px;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

interface Module {
  id: string;
  title: string;
  moduleNumber: number | null;
  description: string | null;
}

interface Enrollment {
  userId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface Course {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isStandalone: boolean;
  createdAt: string;
  modules: Module[];
  enrollments: Enrollment[];
}

export default function AdminCoursesPage() {
  const { isExpanded } = useSidebar();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    show: boolean;
    courseId: string | null;
    courseName: string;
  }>({
    show: false,
    courseId: null,
    courseName: "",
  });

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

  useEffect(() => {
    if (isAdmin) {
      fetchCourses();
    }
  }, [isAdmin]);

  // Filter courses based on search query
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

  if (isAdmin === null || isLoading) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <LoadingSpinner />
      </StyledMainContent>
    );
  }

  if (isAdmin === false) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <Alert type="error">Access Denied</Alert>
      </StyledMainContent>
    );
  }

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledHeader>
          <HeaderContent>
            <StyledTitle>Course Management</StyledTitle>
            <StyledSubtitle>
              Manage courses, modules, and enrollments
            </StyledSubtitle>
          </HeaderContent>
          <Button variant="primary" onClick={() => router.push("/admin/new-course")}>
            <AddIcon fontSize="small" />
            Add New Course
          </Button>
        </StyledHeader>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by course name, description, or enrolled user name/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
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
        {message && <Alert type={message.type}>{message.text}</Alert>}

        {filteredCourses.length === 0 ? (
          <EmptyState>
            {searchQuery ? (
              <>
                <p>No courses found matching "{searchQuery}"</p>
                <Button
                  variant="secondary"
                  onClick={() => setSearchQuery("")}
                  style={{ marginTop: "16px" }}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <p>No courses found</p>
                <Button
                  variant="primary"
                  onClick={() => router.push("/admin/new-course")}
                  style={{ marginTop: "16px" }}
                >
                  <AddIcon fontSize="small" />
                  Add Your First Course
                </Button>
              </>
            )}
          </EmptyState>
        ) : (
          <CoursesGrid>
            {filteredCourses.map((course) => (
              <CourseCard key={course.id}>
                <CourseHeader>
                  <CourseInfo>
                    <CourseTitle>{course.name}</CourseTitle>
                    {course.description && (
                      <CourseDescription>{course.description}</CourseDescription>
                    )}
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
                  <ButtonGroup>
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

                <ModulesSection>
                  <ModulesTitle>Modules ({course.modules.length})</ModulesTitle>
                  {course.modules.length > 0 ? (
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
                    <EmptyState style={{ padding: "20px" }}>No modules</EmptyState>
                  )}
                </ModulesSection>

                <EnrollmentsSection>
                  <ModulesTitle>
                    Enrolled Users ({course.enrollments.length})
                  </ModulesTitle>
                  {course.enrollments.length > 0 ? (
                    <EnrollmentsList>
                      {course.enrollments.map((enrollment) => (
                        <EnrollmentItem key={enrollment.userId}>
                          <UserInfo>
                            {enrollment.user.name || "Unknown User"} ({enrollment.user.email})
                          </UserInfo>
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
                    <EmptyState style={{ padding: "20px" }}>No enrollments</EmptyState>
                  )}
                </EnrollmentsSection>
              </CourseCard>
            ))}
          </CoursesGrid>
        )}

        <Modal show={deleteModal.show} onClick={() => setDeleteModal({ show: false, courseId: null, courseName: "" })}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Delete Course</ModalTitle>
            <ModalText>
              Are you sure you want to delete "{deleteModal.courseName}"? This action cannot be undone and will remove all associated modules and enrollments.
            </ModalText>
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