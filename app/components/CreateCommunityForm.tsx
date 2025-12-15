"use client";

import CloudinaryImageWidget from "@/app/components/CloudinaryImageWidget";
import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useState } from "react";

const StyledFormContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  background-color: white;
  margin: 24px 0px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
`;

const StyledFormField = styled.div`
  margin-bottom: 12px;
`;

const StyledLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 4px;
  color: charcoal;
`;

const StyledInput = styled.input`
  padding: 8px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 8px;
  border: 1px solid gray;
  border-radius: 4px;
`;

const StyledTextarea = styled.textarea`
  padding: 8px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 8px;
  resize: vertical;
  border: 1px solid gray;
  border-radius: 4px;
`;

const StyledUploadSection = styled.div`
  margin-bottom: 16px;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const StyledButton = styled.button`
  padding: 12px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 8px;
  &:hover {
    background-color: red;
  }

  &:disabled {
    background-color: lightblue;
    cursor: not-allowed;
  }
`;

const StyledErrorMessage = styled.p`
  color: red;
  font-size: 14px;
  margin-top: 4px;
`;

const StyledAttachmentNote = styled.p`
  font-size: 14px;
  color: gray;
  margin-top: 4px;
  font-style: italic;
`;

export function CreateCommunityForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!name.trim()) {
      setError("Please enter a name for your community");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description for your community");
      return;
    }

    if (!category.trim()) {
      setError("Please select a category for your community");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/communities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          category,
          imageUrl: imageUrl || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create community");
      }

      setName("");
      setDescription("");
      setCategory("");
      setImageUrl("");
      router.push("/communities");
    } catch (error: any) {
      console.error("Error creating community:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  return (
    <StyledFormContainer>
      <form onSubmit={handleSubmit}>
        <StyledFormField>
          <StyledLabel htmlFor="name">Community Name</StyledLabel>
          <StyledInput
            id="name"
            type="text"
            placeholder="Enter community name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </StyledFormField>

        <StyledFormField>
          <StyledLabel htmlFor="description">Description</StyledLabel>
          <StyledTextarea
            id="description"
            placeholder="Write a description for your community..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            required
          />
        </StyledFormField>

        <StyledFormField>
          <StyledLabel htmlFor="category">Category</StyledLabel>
          <StyledInput
            id="category"
            type="text"
            placeholder="Enter a category for your community"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          />
        </StyledFormField>

        <StyledUploadSection>
          <StyledLabel>Add a Community Logo (Optional)</StyledLabel>
          <CloudinaryImageWidget
            onUpload={(url) => setImageUrl(url)}
            currentUrl={imageUrl}
            label="Upload Logo"
          />
          <StyledAttachmentNote>
            Attach your image using the button above. The image will be used as
            the community logo.
          </StyledAttachmentNote>
        </StyledUploadSection>

        {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

        <StyledButtonContainer>
          <StyledButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Community"}
          </StyledButton>
        </StyledButtonContainer>
      </form>
    </StyledFormContainer>
  );
}
