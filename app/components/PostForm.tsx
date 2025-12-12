"use client";

import styled from "@emotion/styled";
import React, { useState } from "react";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

const StyledPostFormContainer = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
`;
const StyledFormField = styled.div`
  margin-bottom: 16px;
`;
const StyledLabel = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
`;
const StyledInput = styled.input`
  padding: 10px 12px;
  font-size: 15px;
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 6px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
`;
const StyledTextarea = styled.textarea`
  padding: 10px 12px;
  font-size: 15px;
  width: 100%;
  resize: vertical;
  border: 1px solid #ddd;
  border-radius: 6px;
  min-height: 120px;
  &:focus {
    outline: none;
    border-color: #2563eb;
  }
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
  font-size: 15px;
  font-weight: 600;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
  &.cancel {
    background-color: #f1f5f9;
    color: #333;
    &:hover {
      background-color: #e2e8f0;
    }
  }
`;
const StyledErrorMessage = styled.p`
  color: #dc2626;
  font-size: 14px;
  margin-top: 4px;
`;

interface PostFormProps {
  communityId: string;
  onPostCreated: () => void;
  onCancel?: () => void;
}

const PostForm: React.FC<PostFormProps> = ({
  communityId,
  onPostCreated,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          communityId,
          title,
          content,
          imageUrl: imageUrl || null,
          pdfUrl: pdfUrl || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }

      setTitle("");
      setContent("");
      setImageUrl("");
      setPdfUrl("");
      onPostCreated();
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <StyledPostFormContainer>
      <form onSubmit={handleSubmit}>
        <StyledFormField>
          <StyledLabel htmlFor="title">Title</StyledLabel>
          <StyledInput
            id="title"
            type="text"
            placeholder="Enter post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </StyledFormField>
        <StyledFormField>
          <StyledLabel htmlFor="content">Content</StyledLabel>
          <StyledTextarea
            id="content"
            placeholder="Write your post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
          />
        </StyledFormField>

        <StyledUploadSection>
          <StyledLabel>Add an Image (Optional)</StyledLabel>
          <CloudinaryUploadWidget
            onUpload={(url) => setImageUrl(url)}
            fileType="image"
            currentUrl={imageUrl}
            label="Upload Image"
          />
        </StyledUploadSection>

        <StyledUploadSection>
          <StyledLabel>Add a PDF Document (Optional)</StyledLabel>
          <CloudinaryUploadWidget
            onUpload={(url) => setPdfUrl(url)}
            fileType="pdf"
            currentUrl={pdfUrl}
            label="Upload PDF"
          />
        </StyledUploadSection>

        {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

        <StyledButtonContainer>
          <StyledButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </StyledButton>
          {onCancel && (
            <StyledButton type="button" className="cancel" onClick={onCancel}>
              Cancel
            </StyledButton>
          )}
        </StyledButtonContainer>
      </form>
    </StyledPostFormContainer>
  );
};

export default PostForm;
