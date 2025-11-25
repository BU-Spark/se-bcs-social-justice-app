// ==============================================================================
// ADMIN REMOVED ENROLLMENTS PAGE - View all removed course enrollments
// ==============================================================================
// This page displays all removed enrollments in the system and allows admins to:
// - View all removed enrollments with user and course information
// - Search/filter by user name, email, or course name
// - See removal history including who removed them and when
// ==============================================================================

"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import HistoryIcon from "@mui/icons-material/History";

// ==============================================================================
// STYLED COMPONENTS - UI styling using Emotion
// ==============================================================================

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
  max-width: 1600px;
  margin: 0 auto;
`;

const StyledHeader = styled.div`
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StyledSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
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

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.thead`
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
`;

const TableHeaderCell = styled.th`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6c757d;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  transition: background 0.2s;

  &:hover {
    background: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #495057;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const UserName = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const CourseName = styled.div`
  font-weight: 500;
  color: #1a1a1a;
`;

const DateCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DateLabel = styled.span`
  font-size: 12px;
  color: #6c757d;
`;

const DateValue = styled.span`
  color: #495057;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${({ status }) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#d4edda";
      case "in_progress":
        return "#fff3cd";
      case "not_started":
        return "#d1ecf1";
      default:
        return "#e9ecef";
    }
  }};
  color: ${({ status }) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#155724";
      case "in_progress":
        return "#856404";
      case "not_started":
        return "#0c5460";
      default:
        return "#495057";
    }
  }};
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

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
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

// ==============================================================================
// INTERFACES
// ==============================================================================

interface RemovedEnrollment {
  id: string;
  userId: string;
  courseId: string;
  userName: string | null;
  userEmail: string | null;
  originalEnrollmentDate: string;
  completionStatusAtRemoval: string;
  trialExpiresAt: string | null;
  removedAt: string;
  removedBy: string;
  reason: string | null;
  course: {
    id: string;
    name: string;
    description: string | null;
  };
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  removedByAdmin: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

// ==============================================================================
// MAIN COMPONENT
// ==============================================================================

export default function RemovedEnrollmentsPage() {
  const { isExpanded } = useSidebar();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [removedEnrollments, setRemovedEnrollments] = useState<
    RemovedEnrollment[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        const data = await res.json();
        if (res.ok && data?.isAdmin) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);

  // Fetch removed enrollments
  const fetchRemovedEnrollments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/removed-enrollments");
      if (res.ok) {
        const data = await res.json();
        setRemovedEnrollments(data.removedEnrollments || []);
      } else {
        const errorData = await res.json();
        setMessage({
          type: "error",
          text: errorData.error || "Failed to fetch removed enrollments",
        });
      }
    } catch (error) {
      console.error("Error fetching removed enrollments:", error);
      setMessage({
        type: "error",
        text: "An error occurred while fetching removed enrollments",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchRemovedEnrollments();
    }
  }, [isAdmin]);

  // Filter removed enrollments based on search query
  const filteredEnrollments = removedEnrollments.filter((enrollment) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    const userName = enrollment.userName?.toLowerCase() || "";
    const userEmail = enrollment.userEmail?.toLowerCase() || "";
    const courseName = enrollment.course.name.toLowerCase();

    return (
      userName.includes(query) ||
      userEmail.includes(query) ||
      courseName.includes(query)
    );
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Render guards
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
        {/* PAGE HEADER */}
        <StyledHeader>
          <StyledTitle>
            <HistoryIcon />
            Removed Enrollments
          </StyledTitle>
          <StyledSubtitle>
            View history of all users who were removed from course enrollments
          </StyledSubtitle>
        </StyledHeader>

        {/* SEARCH SECTION */}
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="Search by user name, email, or course name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        {/* MESSAGE DISPLAY */}
        {message && <Alert type={message.type}>{message.text}</Alert>}

        {/* TABLE SECTION */}
        <TableContainer>
          {filteredEnrollments.length === 0 ? (
            <EmptyState>
              {searchQuery
                ? `No removed enrollments found matching "${searchQuery}"`
                : "No removed enrollments found"}
            </EmptyState>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHeaderCell>User</TableHeaderCell>
                  <TableHeaderCell>Course</TableHeaderCell>
                  <TableHeaderCell>Enrollment Date</TableHeaderCell>
                  <TableHeaderCell>Status at Removal</TableHeaderCell>
                  <TableHeaderCell>Removed At</TableHeaderCell>
                  <TableHeaderCell>Removed By</TableHeaderCell>
                  <TableHeaderCell>Reason</TableHeaderCell>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment) => (
                  <TableRow key={enrollment.id}>
                    <TableCell>
                      <UserInfo>
                        <UserName>
                          {enrollment.userName ||
                            enrollment.user?.name ||
                            "Unknown User"}
                        </UserName>
                        <UserEmail>
                          {enrollment.userEmail ||
                            enrollment.user?.email ||
                            "No email"}
                        </UserEmail>
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      <CourseName>{enrollment.course.name}</CourseName>
                    </TableCell>
                    <TableCell>
                      <DateCell>
                        <DateValue>
                          {formatDate(enrollment.originalEnrollmentDate)}
                        </DateValue>
                      </DateCell>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={enrollment.completionStatusAtRemoval}>
                        {enrollment.completionStatusAtRemoval
                          .replace("_", " ")
                          .toUpperCase()}
                      </StatusBadge>
                    </TableCell>
                    <TableCell>
                      <DateCell>
                        <DateValue>{formatDate(enrollment.removedAt)}</DateValue>
                      </DateCell>
                    </TableCell>
                    <TableCell>
                      <UserInfo>
                        <UserName>
                          {enrollment.removedByAdmin?.name || "Unknown Admin"}
                        </UserName>
                        <UserEmail>
                          {enrollment.removedByAdmin?.email || `ID: ${enrollment.removedBy}`}
                        </UserEmail>
                      </UserInfo>
                    </TableCell>
                    <TableCell>
                      {enrollment.reason || (
                        <span style={{ color: "#6c757d", fontStyle: "italic" }}>
                          No reason provided
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        {/* SUMMARY INFO */}
        {filteredEnrollments.length > 0 && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              background: "white",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              fontSize: "14px",
              color: "#6c757d",
            }}
          >
            Showing {filteredEnrollments.length} of {removedEnrollments.length}{" "}
            removed enrollment{removedEnrollments.length !== 1 ? "s" : ""}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
        )}
      </StyledContainer>
    </StyledMainContent>
  );
}

