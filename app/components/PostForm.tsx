"use client";

import styled from "@emotion/styled";
import React, { useState } from "react";
import CloudinaryUploadWidget from "./CloudinaryUploadWidget";

const StyledPostFormContainer = styled.div`
  padding: 16px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: silver;
  margin-bottom: 24px;
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

    if (!title.trim()) {
      setError("Please enter a title for your post");
      return;
    }

    if (!content.trim()) {
      setError("Please enter content for your post");
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
          <StyledAttachmentNote>
            Attach an image: JPG, PNG, GIF (max 5MB)
          </StyledAttachmentNote>
        </StyledUploadSection>

        <StyledUploadSection>
          <StyledLabel>Add a PDF Document (Optional)</StyledLabel>
          <CloudinaryUploadWidget
            onUpload={(url) => setPdfUrl(url)}
            fileType="pdf"
            currentUrl={pdfUrl}
            label="Upload PDF"
          />
          <StyledAttachmentNote>
            Attach a PDF: (max 10MB) available for download
          </StyledAttachmentNote>
        </StyledUploadSection>

        {error && <StyledErrorMessage>{error}</StyledErrorMessage>}

        <StyledButtonContainer>
          <StyledButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post"}
          </StyledButton>

          {onCancel && (
            <StyledButton type="button" onClick={onCancel}>
              Cancel
            </StyledButton>
          )}
        </StyledButtonContainer>
      </form>
    </StyledPostFormContainer>
  );
};

export default PostForm;
