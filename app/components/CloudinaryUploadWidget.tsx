"use client";

import React, { useEffect, useRef } from "react";
import styled from "@emotion/styled";

declare global {
  interface Window {
    cloudinary: any;
  }
}

const StyledButton = styled.button`
  padding: 12px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin: 8px;
  &:hover {
    background-color: darkblue;
  }
`;

const StyledPreviewContainer = styled.div`
  margin: 12px 0;
  padding: 8px;
  border: 1px dashed gray;
  border-radius: 4px;
  background-color: whitesmoke;
`;

const StyledPdfPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StyledPdfIcon = styled.div`
  width: 40px;
  height: 50px;
  background-color: red;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  border-radius: 4px;
`;

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void;
  label?: string;
  fileType?: "image" | "pdf" | "any";
  currentUrl?: string;
}

const CloudinaryUploadWidget: React.FC<CloudinaryUploadWidgetProps> = ({
  onUpload,
  label,
  fileType = "any",
  currentUrl,
}) => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (window.cloudinary) {
      const options: any = {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        multiple: false,
      };

      if (fileType === "image") {
        options.resourceType = "image";
        options.sources = ["local", "camera"];
        options.maxFileSize = 5000000;
        options.acceptedFiles = "image/*";
      } else if (fileType === "pdf") {
        options.resourceType = "raw";
        options.sources = ["local"];
        options.maxFileSize = 10000000;
        options.acceptedFiles = ".pdf";
      }

      widgetRef.current = window.cloudinary.createUploadWidget(
        options,
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            onUpload(result.info.secure_url);
          } else if (error) {
            console.error("Cloudinary upload error:", error);
          }
        }
      );
    }
  }, [onUpload, fileType]);

  const openWidget = (e: React.MouseEvent) => {
    e.preventDefault();
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  const getFilenameFromUrl = (url: string) => {
    const parts = url.split("/");
    let filename = parts[parts.length - 1];
    if (filename.includes("?")) {
      filename = filename.split("?")[0];
    }
    return filename.length > 25 ? filename.substring(0, 22) + "..." : filename;
  };

  return (
    <>
      <StyledButton type="button" onClick={openWidget}>
        {label ||
          `Upload ${fileType === "image" ? "Image" : fileType === "pdf" ? "PDF" : "File"}`}
      </StyledButton>

      {currentUrl && fileType === "image" && (
        <StyledPreviewContainer>
          <p>Image Preview:</p>
          <img
            src={currentUrl}
            alt="Uploaded Image"
            style={{ maxWidth: "200px" }}
          />
        </StyledPreviewContainer>
      )}

      {currentUrl && fileType === "pdf" && (
        <StyledPreviewContainer>
          <StyledPdfPreview>
            <StyledPdfIcon>PDF</StyledPdfIcon>
            <div>
              <p>PDF Uploaded: {getFilenameFromUrl(currentUrl)}</p>
              <a href={currentUrl} target="_blank" rel="noopener noreferrer">
                View PDF
              </a>
            </div>
          </StyledPdfPreview>
        </StyledPreviewContainer>
      )}
    </>
  );
};

export default CloudinaryUploadWidget;
