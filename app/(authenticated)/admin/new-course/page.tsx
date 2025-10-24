"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";

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
  max-width: 900px;
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
`;

const StyledSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

const FormSection = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #495057;
  margin-bottom: 8px;
`;

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

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #495057;
  cursor: pointer;
`;

const ModuleCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
`;

const ModuleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ModuleTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

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

interface Module {
  title: string;
  moduleNumber: number;
  description: string;
}

export default function NewCoursePage() {
  const { isExpanded } = useSidebar();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Course form state
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [coursePrice, setCoursePrice] = useState("");
  const [isStandalone, setIsStandalone] = useState(true);
  const [modules, setModules] = useState<Module[]>([]);

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

  const addModule = () => {
    setModules([
      ...modules,
      {
        title: "",
        moduleNumber: modules.length + 1,
        description: "",
      },
    ]);
  };

  const removeModule = (index: number) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    // Re-number modules
    updatedModules.forEach((module, i) => {
      module.moduleNumber = i + 1;
    });
    setModules(updatedModules);
  };

  const updateModule = (
    index: number,
    field: keyof Module,
    value: string | number
  ) => {
    const updatedModules = [...modules];
    updatedModules[index] = {
      ...updatedModules[index],
      [field]: value,
    };
    setModules(updatedModules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!courseName.trim()) {
      setMessage({ type: "error", text: "Course name is required" });
      return;
    }

    const price = parseFloat(coursePrice);
    if (isNaN(price) || price < 0) {
      setMessage({ type: "error", text: "Please enter a valid price" });
      return;
    }

    // Validate modules
    for (let i = 0; i < modules.length; i++) {
      if (!modules[i].title.trim()) {
        setMessage({
          type: "error",
          text: `Module ${i + 1} must have a title`,
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/new-course", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: courseName.trim(),
          description: courseDescription.trim() || null,
          price,
          isStandalone,
          modules: modules.map((module) => ({
            title: module.title.trim(),
            moduleNumber: module.moduleNumber,
            description: module.description.trim() || null,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Course created successfully!" });
        // Reset form
        setCourseName("");
        setCourseDescription("");
        setCoursePrice("");
        setIsStandalone(true);
        setModules([]);

        // Redirect after a short delay
        setTimeout(() => {
          router.push("/settings");
        }, 2000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to create course",
        });
      }
    } catch (error) {
      console.error("Error creating course:", error);
      setMessage({ type: "error", text: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  if (isAdmin === null) {
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
          <StyledTitle>Add New Course Package</StyledTitle>
          <StyledSubtitle>
            Create a new course package with modules for the coaching page
          </StyledSubtitle>
        </StyledHeader>

        {message && <Alert type={message.type}>{message.text}</Alert>}

        <form onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>Course Information</SectionTitle>

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

          <FormSection>
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
              <Button
                type="button"
                variant="secondary"
                onClick={addModule}
                disabled={isLoading}
              >
                + Add Module
              </Button>
            </div>

            {modules.length === 0 ? (
              <p style={{ color: "#6c757d", fontSize: "14px" }}>
                No modules added yet. Click "Add Module" to get started.
              </p>
            ) : (
              modules.map((module, index) => (
                <ModuleCard key={index}>
                  <ModuleHeader>
                    <ModuleTitle>Module {module.moduleNumber}</ModuleTitle>
                    <SmallButton
                      type="button"
                      variant="danger"
                      onClick={() => removeModule(index)}
                      disabled={isLoading}
                    >
                      Remove
                    </SmallButton>
                  </ModuleHeader>

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

          <ButtonGroup>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push("/settings")}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Course"}
            </Button>
          </ButtonGroup>
        </form>
      </StyledContainer>
    </StyledMainContent>
  );
}