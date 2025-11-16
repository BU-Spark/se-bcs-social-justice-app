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

// File dropbox container with drag-and-drop styling
// const FileDropbox = styled.div<{ isDragging?: boolean }>`
//   border: 2px dashed ${({ isDragging }) => (isDragging ? "#667eea" : "#dee2e6")};
//   border-radius: 8px;
//   padding: 24px;
//   text-align: center;
//   background: ${({ isDragging }) => (isDragging ? "#f0f3ff" : "#f8f9fa")};
//   transition: all 0.3s;
//   cursor: pointer;

//   &:hover {
//     border-color: #667eea;
//     background: #f0f3ff;
//   }
// `;

// Icon and text container for dropbox
// const DropboxContent = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   gap: 8px;
// `;

// Dropbox icon styling
// const DropboxIcon = styled.div`
//   font-size: 36px;
//   color: #667eea;
// `;

// Dropbox text styling
// const DropboxText = styled.p`
//   font-size: 14px;
//   color: #495057;
//   margin: 0;
// `;

// Dropbox subtext for file types
// const DropboxSubtext = styled.p`
//   font-size: 12px;
//   color: #6c757d;
//   margin: 4px 0 0 0;
// `;

// Hidden file input
const HiddenFileInput = styled.input`
  display: none;
`;

// File list container showing uploaded files
const FileList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// Individual file item display
const FileItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 13px;
`;

// File info (name and size)
const FileInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

// File name with truncation
const FileName = styled.span`
  color: #495057;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

// File size text
const FileSize = styled.span`
  color: #6c757d;
  font-size: 12px;
  flex-shrink: 0;
`;

// Remove file button
const RemoveFileButton = styled.button`
  padding: 4px 8px;
  border: none;
  background: #dc3545;
  color: white;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #c82333;
  }
`;

// Media upload grid container
const MediaUploadGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 12px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Individual media upload box
const MediaUploadBox = styled.div<{ isDragging?: boolean }>`
  border: 2px dashed ${({ isDragging }) => (isDragging ? "#667eea" : "#dee2e6")};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background: ${({ isDragging }) => (isDragging ? "#f0f3ff" : "#ffffff")};
  transition: all 0.3s;
  cursor: pointer;

  &:hover {
    border-color: #667eea;
    background: #f0f3ff;
  }
`;

// Media upload icon
const MediaUploadIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

// Media upload title
const MediaUploadTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 4px;
`;

// Media upload subtext
const MediaUploadSubtext = styled.div`
  font-size: 11px;
  color: #6c757d;
`;

// ==============================================================================
// TYPESCRIPT INTERFACES
// ==============================================================================

// Uploaded file with S3 URL
interface UploadedFile {
  name: string; // Original file name
  url: string; // S3 URL
  size: number; // File size in bytes
}

// API response types for course data from database
interface ApiModuleContent {
  title: string;
  externalLink: string;
  contentType: "IMAGE" | "VIDEO" | "AUDIO" | "PDF" | "TEXT" | "LINK";
}

interface ApiModule {
  id: string;
  title: string;
  moduleNumber: number;
  description: string;
  contents?: ApiModuleContent[];
}

// Payload types for creating/updating courses
interface ModuleContentPayload {
  type: "IMAGE" | "VIDEO" | "AUDIO" | "PDF";
  name: string;
  externalLink: string;
}

// Module interface - represents a single course module
// id is optional because new modules don't have IDs yet
interface Module {
  id?: string; // Optional - only exists for saved modules
  title: string; // Module title (required)
  moduleNumber: number; // Sequential number for ordering
  description: string; // Module description text
  imageFiles?: UploadedFile[]; // Uploaded image files with S3 URLs
  videoFiles?: UploadedFile[]; // Uploaded video files with S3 URLs
  audioFiles?: UploadedFile[]; // Uploaded audio files with S3 URLs
  textFiles?: UploadedFile[]; // Uploaded text/document files with S3 URLs
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

  // File drag state for dropbox
  const [draggedModule, setDraggedModule] = useState<{
    index: number;
    type: string;
  } | null>(null); // Track which module and media type is being dragged over

  // Track upload progress for each file
  const [uploadingFiles, setUploadingFiles] = useState<{
    [key: string]: boolean;
  }>({}); // Track which files are uploading

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

        // Map modules to include all necessary fields and organize contents by type
        setModules(
          data.modules.map((m: ApiModule) => {
            // Organize contents by type
            const imageFiles: UploadedFile[] = [];
            const videoFiles: UploadedFile[] = [];
            const audioFiles: UploadedFile[] = [];
            const textFiles: UploadedFile[] = [];

            if (m.contents && Array.isArray(m.contents)) {
              m.contents.forEach((content: ApiModuleContent) => {
                const uploadedFile: UploadedFile = {
                  name: content.title || "Untitled",
                  url: content.externalLink,
                  size: 0, // Size not stored in DB, set to 0
                };

                switch (content.contentType) {
                  case "IMAGE":
                    imageFiles.push(uploadedFile);
                    break;
                  case "VIDEO":
                    videoFiles.push(uploadedFile);
                    break;
                  case "AUDIO":
                    audioFiles.push(uploadedFile);
                    break;
                  case "PDF":
                  case "TEXT":
                  case "LINK":
                    textFiles.push(uploadedFile);
                    break;
                }
              });
            }

            return {
              id: m.id, // Keep existing module IDs for updates
              title: m.title,
              moduleNumber: m.moduleNumber,
              description: m.description || "",
              imageFiles,
              videoFiles,
              audioFiles,
              textFiles,
            };
          }),
        );
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
        imageFiles: [], // Empty image files array
        videoFiles: [], // Empty video files array
        audioFiles: [], // Empty audio files array
        textFiles: [], // Empty text files array
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
    value: string | number,
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
  // FILE HANDLING FUNCTIONS
  // ------------------------------------------------------------------------------

  /**
   * Upload a file to S3 using presigned URL approach
   * This bypasses Next.js body size limits by uploading directly to S3
   * @param file - File to upload
   * @param folder - S3 folder name (e.g., courseVideos, courseImage, courseAudio, courseFile)
   * @returns S3 public URL or null if failed
   */
  const uploadFileToS3 = async (
    file: File,
    folder: string,
  ): Promise<string | null> => {
    try {
      // Step 1: Generate unique filename
      const fileName = `${folder}/${Date.now()}-${file.name}`;

      // Step 2: Get presigned URL from backend
      const response = await fetch(
        `/api/upload?fileName=${encodeURIComponent(fileName)}&contentType=${encodeURIComponent(file.type)}`,
      );

      if (!response.ok) {
        throw new Error(`Failed to get presigned URL: ${response.statusText}`);
      }

      const { url: signedUrl } = await response.json();

      // Step 3: Upload file directly to S3 using presigned URL
      const uploadResponse = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error(`S3 upload failed: ${uploadResponse.statusText}`);
      }

      // Step 4: Return public S3 URL (remove query parameters from signed URL)
      const publicUrl = signedUrl.split("?")[0];
      return publicUrl;
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      return null;
    }
  };

  /**
   * Handle file selection for a specific media type
   * Uploads files immediately to S3 and stores URLs
   * @param index - Array index of module
   * @param files - FileList from input or drag event
   * @param mediaType - Type of media (image, video, audio, text)
   */
  const handleMediaFileSelect = async (
    index: number,
    files: FileList | null,
    mediaType: "image" | "video" | "audio" | "text",
  ) => {
    if (!files || files.length === 0) return;

    // Convert FileList to Array and filter by media type
    const acceptedFiles = Array.from(files).filter((file) => {
      const matchesType =
        file.type.startsWith(`${mediaType}/`) ||
        (mediaType === "text" &&
          (file.type === "application/pdf" ||
            file.name.endsWith(".pdf") ||
            file.name.endsWith(".doc") ||
            file.name.endsWith(".docx")));
      return matchesType;
    });

    if (acceptedFiles.length === 0) {
      alert(`Please select valid ${mediaType} files.`);
      return;
    }

    // Map media type to S3 folder name
    const folderMap: { [key: string]: string } = {
      image: "courseImage",
      video: "courseVideos",
      audio: "courseAudio",
      text: "courseFile",
    };
    const s3Folder = folderMap[mediaType];

    // Upload each file to S3
    const uploadPromises = acceptedFiles.map(async (file) => {
      const uploadKey = `${index}-${mediaType}-${file.name}`;
      setUploadingFiles((prev) => ({ ...prev, [uploadKey]: true }));

      const url = await uploadFileToS3(file, s3Folder);

      setUploadingFiles((prev) => {
        const updated = { ...prev };
        delete updated[uploadKey];
        return updated;
      });

      if (url) {
        return {
          name: file.name,
          url,
          size: file.size,
        };
      }
      return null;
    });

    const uploadedFiles = (await Promise.all(uploadPromises)).filter(
      (f): f is UploadedFile => f !== null,
    );

    if (uploadedFiles.length === 0) {
      alert("All uploads failed. Please try again.");
      return;
    }

    // Update module with uploaded files
    const updatedModules = [...modules];
    const fileKey = `${mediaType}Files` as
      | "imageFiles"
      | "videoFiles"
      | "audioFiles"
      | "textFiles";
    const existingFiles = updatedModules[index][fileKey] || [];
    updatedModules[index] = {
      ...updatedModules[index],
      [fileKey]: [...existingFiles, ...uploadedFiles],
    };
    setModules(updatedModules);

    if (uploadedFiles.length < acceptedFiles.length) {
      alert(
        `${uploadedFiles.length} of ${acceptedFiles.length} files uploaded successfully.`,
      );
    }
  };

  /**
   * Handle drag over event for media upload box
   * @param e - Drag event
   * @param index - Array index of module
   * @param mediaType - Type of media being dragged
   */
  const handleMediaDragOver = (
    e: React.DragEvent,
    index: number,
    mediaType: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedModule({ index, type: mediaType });
  };

  /**
   * Handle drag leave event for media upload box
   * @param e - Drag event
   */
  const handleMediaDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedModule(null);
  };

  /**
   * Handle file drop event for specific media type
   * @param e - Drag event
   * @param index - Array index of module
   * @param mediaType - Type of media being dropped
   */
  const handleMediaDrop = (
    e: React.DragEvent,
    index: number,
    mediaType: "image" | "video" | "audio" | "text",
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedModule(null);

    const files = e.dataTransfer.files;
    handleMediaFileSelect(index, files, mediaType);
  };

  /**
   * Remove a file from module's media file list
   * @param moduleIndex - Array index of module
   * @param fileIndex - Array index of file to remove
   * @param mediaType - Type of media file to remove
   */
  const removeMediaFile = (
    moduleIndex: number,
    fileIndex: number,
    mediaType: "image" | "video" | "audio" | "text",
  ) => {
    const updatedModules = [...modules];
    const fileKey = `${mediaType}Files` as
      | "imageFiles"
      | "videoFiles"
      | "audioFiles"
      | "textFiles";
    const files = updatedModules[moduleIndex][fileKey] || [];
    updatedModules[moduleIndex] = {
      ...updatedModules[moduleIndex],
      [fileKey]: files.filter((_, i) => i !== fileIndex),
    };
    setModules(updatedModules);
  };

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted string (e.g., "1.5 MB")
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
        : "/api/admin/add-new-course"; // Create new course

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
          modules: modules.map((module) => {
            // Collect all uploaded files as module content
            const contents: ModuleContentPayload[] = [];

            // Add images
            if (module.imageFiles && module.imageFiles.length > 0) {
              module.imageFiles.forEach((file) => {
                contents.push({
                  type: "IMAGE",
                  name: file.name,
                  externalLink: file.url,
                });
              });
            }

            // Add videos
            if (module.videoFiles && module.videoFiles.length > 0) {
              module.videoFiles.forEach((file) => {
                contents.push({
                  type: "VIDEO",
                  name: file.name,
                  externalLink: file.url,
                });
              });
            }

            // Add audio
            if (module.audioFiles && module.audioFiles.length > 0) {
              module.audioFiles.forEach((file) => {
                contents.push({
                  type: "AUDIO",
                  name: file.name,
                  externalLink: file.url,
                });
              });
            }

            // Add text/documents
            if (module.textFiles && module.textFiles.length > 0) {
              module.textFiles.forEach((file) => {
                contents.push({
                  type: "PDF",
                  name: file.name,
                  externalLink: file.url,
                });
              });
            }

            return {
              id: module.id, // Include ID for updates (undefined for new modules)
              title: module.title.trim(),
              moduleNumber: module.moduleNumber,
              description: module.description.trim() || null, // null if empty
              contents: contents.length > 0 ? contents : undefined,
            };
          }),
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
          text: courseId
            ? "Course updated successfully!"
            : "Course created successfully!",
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
          text:
            data.error || `Failed to ${courseId ? "update" : "create"} course`,
        });
      }
    } catch (error) {
      // Network or other error occurred
      console.error(
        `Error ${courseId ? "updating" : "creating"} course:`,
        error,
      );
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
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
            {courseId ? "Edit Course Package" : "Add New Course Package"}
          </StyledTitle>
          <StyledSubtitle>
            {courseId
              ? "Modify course details and manage modules"
              : "Create a new course package with modules for the coaching page"}
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
                No modules added yet. Click &quot;Add Module&quot; to get
                started.
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
                  <FormGroup>
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

                  {/* Module Content Files - 4 separate upload areas by media type */}
                  <FormGroup style={{ marginBottom: 0 }}>
                    <Label>Module Content Files</Label>

                    {/* Hidden file inputs for each media type */}
                    <HiddenFileInput
                      id={`image-input-${index}`}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        handleMediaFileSelect(index, e.target.files, "image")
                      }
                      disabled={isLoading}
                    />
                    <HiddenFileInput
                      id={`video-input-${index}`}
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) =>
                        handleMediaFileSelect(index, e.target.files, "video")
                      }
                      disabled={isLoading}
                    />
                    <HiddenFileInput
                      id={`audio-input-${index}`}
                      type="file"
                      multiple
                      accept="audio/*"
                      onChange={(e) =>
                        handleMediaFileSelect(index, e.target.files, "audio")
                      }
                      disabled={isLoading}
                    />
                    <HiddenFileInput
                      id={`text-input-${index}`}
                      type="file"
                      multiple
                      accept="text/*,.txt,.doc,.docx,.pdf"
                      onChange={(e) =>
                        handleMediaFileSelect(index, e.target.files, "text")
                      }
                      disabled={isLoading}
                    />

                    {/* Grid of 4 media upload boxes */}
                    <MediaUploadGrid>
                      {/* IMAGE UPLOAD */}
                      <div>
                        <MediaUploadBox
                          isDragging={
                            draggedModule?.index === index &&
                            draggedModule?.type === "image"
                          }
                          onClick={() =>
                            !isLoading &&
                            document
                              .getElementById(`image-input-${index}`)
                              ?.click()
                          }
                          onDragOver={(e) =>
                            !isLoading && handleMediaDragOver(e, index, "image")
                          }
                          onDragLeave={(e) =>
                            !isLoading && handleMediaDragLeave(e)
                          }
                          onDrop={(e) =>
                            !isLoading && handleMediaDrop(e, index, "image")
                          }
                        >
                          <MediaUploadIcon>🖼️</MediaUploadIcon>
                          <MediaUploadTitle>Images</MediaUploadTitle>
                          <MediaUploadSubtext>
                            JPG, PNG, GIF, etc.
                          </MediaUploadSubtext>
                        </MediaUploadBox>
                        {/* Display selected image files */}
                        {module.imageFiles && module.imageFiles.length > 0 && (
                          <FileList>
                            {module.imageFiles.map((file, fileIndex) => (
                              <FileItem key={fileIndex}>
                                <FileInfo>
                                  <FileName title={file.name}>
                                    {file.name}
                                  </FileName>
                                  <FileSize>
                                    {formatFileSize(file.size)}
                                  </FileSize>
                                </FileInfo>
                                <RemoveFileButton
                                  type="button"
                                  onClick={() =>
                                    removeMediaFile(index, fileIndex, "image")
                                  }
                                  disabled={isLoading}
                                >
                                  ×
                                </RemoveFileButton>
                              </FileItem>
                            ))}
                          </FileList>
                        )}
                      </div>

                      {/* VIDEO UPLOAD */}
                      <div>
                        <MediaUploadBox
                          isDragging={
                            draggedModule?.index === index &&
                            draggedModule?.type === "video"
                          }
                          onClick={() =>
                            !isLoading &&
                            document
                              .getElementById(`video-input-${index}`)
                              ?.click()
                          }
                          onDragOver={(e) =>
                            !isLoading && handleMediaDragOver(e, index, "video")
                          }
                          onDragLeave={(e) =>
                            !isLoading && handleMediaDragLeave(e)
                          }
                          onDrop={(e) =>
                            !isLoading && handleMediaDrop(e, index, "video")
                          }
                        >
                          <MediaUploadIcon>🎥</MediaUploadIcon>
                          <MediaUploadTitle>Videos</MediaUploadTitle>
                          <MediaUploadSubtext>
                            MP4, MOV, AVI, etc.
                          </MediaUploadSubtext>
                        </MediaUploadBox>
                        {/* Display selected video files */}
                        {module.videoFiles && module.videoFiles.length > 0 && (
                          <FileList>
                            {module.videoFiles.map((file, fileIndex) => (
                              <FileItem key={fileIndex}>
                                <FileInfo>
                                  <FileName title={file.name}>
                                    {file.name}
                                  </FileName>
                                  <FileSize>
                                    {formatFileSize(file.size)}
                                  </FileSize>
                                </FileInfo>
                                <RemoveFileButton
                                  type="button"
                                  onClick={() =>
                                    removeMediaFile(index, fileIndex, "video")
                                  }
                                  disabled={isLoading}
                                >
                                  ×
                                </RemoveFileButton>
                              </FileItem>
                            ))}
                          </FileList>
                        )}
                      </div>

                      {/* AUDIO UPLOAD */}
                      <div>
                        <MediaUploadBox
                          isDragging={
                            draggedModule?.index === index &&
                            draggedModule?.type === "audio"
                          }
                          onClick={() =>
                            !isLoading &&
                            document
                              .getElementById(`audio-input-${index}`)
                              ?.click()
                          }
                          onDragOver={(e) =>
                            !isLoading && handleMediaDragOver(e, index, "audio")
                          }
                          onDragLeave={(e) =>
                            !isLoading && handleMediaDragLeave(e)
                          }
                          onDrop={(e) =>
                            !isLoading && handleMediaDrop(e, index, "audio")
                          }
                        >
                          <MediaUploadIcon>🎵</MediaUploadIcon>
                          <MediaUploadTitle>Audio</MediaUploadTitle>
                          <MediaUploadSubtext>
                            MP3, WAV, AAC, etc.
                          </MediaUploadSubtext>
                        </MediaUploadBox>
                        {/* Display selected audio files */}
                        {module.audioFiles && module.audioFiles.length > 0 && (
                          <FileList>
                            {module.audioFiles.map((file, fileIndex) => (
                              <FileItem key={fileIndex}>
                                <FileInfo>
                                  <FileName title={file.name}>
                                    {file.name}
                                  </FileName>
                                  <FileSize>
                                    {formatFileSize(file.size)}
                                  </FileSize>
                                </FileInfo>
                                <RemoveFileButton
                                  type="button"
                                  onClick={() =>
                                    removeMediaFile(index, fileIndex, "audio")
                                  }
                                  disabled={isLoading}
                                >
                                  ×
                                </RemoveFileButton>
                              </FileItem>
                            ))}
                          </FileList>
                        )}
                      </div>

                      {/* TEXT/DOCUMENT UPLOAD */}
                      <div>
                        <MediaUploadBox
                          isDragging={
                            draggedModule?.index === index &&
                            draggedModule?.type === "text"
                          }
                          onClick={() =>
                            !isLoading &&
                            document
                              .getElementById(`text-input-${index}`)
                              ?.click()
                          }
                          onDragOver={(e) =>
                            !isLoading && handleMediaDragOver(e, index, "text")
                          }
                          onDragLeave={(e) =>
                            !isLoading && handleMediaDragLeave(e)
                          }
                          onDrop={(e) =>
                            !isLoading && handleMediaDrop(e, index, "text")
                          }
                        >
                          <MediaUploadIcon>📄</MediaUploadIcon>
                          <MediaUploadTitle>Documents</MediaUploadTitle>
                          <MediaUploadSubtext>
                            TXT, PDF, DOC, etc.
                          </MediaUploadSubtext>
                        </MediaUploadBox>
                        {/* Display selected text files */}
                        {module.textFiles && module.textFiles.length > 0 && (
                          <FileList>
                            {module.textFiles.map((file, fileIndex) => (
                              <FileItem key={fileIndex}>
                                <FileInfo>
                                  <FileName title={file.name}>
                                    {file.name}
                                  </FileName>
                                  <FileSize>
                                    {formatFileSize(file.size)}
                                  </FileSize>
                                </FileInfo>
                                <RemoveFileButton
                                  type="button"
                                  onClick={() =>
                                    removeMediaFile(index, fileIndex, "text")
                                  }
                                  disabled={isLoading}
                                >
                                  ×
                                </RemoveFileButton>
                              </FileItem>
                            ))}
                          </FileList>
                        )}
                      </div>
                    </MediaUploadGrid>
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
              {
                isLoading
                  ? courseId
                    ? "Updating..."
                    : "Creating..." // Loading state
                  : courseId
                    ? "Update Course"
                    : "Create Course" // Default state
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
