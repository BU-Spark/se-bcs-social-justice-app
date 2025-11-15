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

interface CloudinaryImageWidgetProps {
  onUpload: (url: string) => void;
  label?: string;
  currentUrl?: string;
}

const CloudinaryImageWidget: React.FC<CloudinaryImageWidgetProps> = ({
  onUpload,
  label,
  currentUrl,
}) => {
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    if (window.cloudinary) {
      const options: any = {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
        multiple: false,
        resourceType: "image",
        sources: ["local", "camera"],
        maxFileSize: 5000000,
        acceptedFiles: "image/*",
      };

      widgetRef.current = window.cloudinary.createUploadWidget(
        options,
        (error: any, result: any) => {
          if (!error && result && result.event === "success") {
            onUpload(result.info.secure_url);
          } else if (error) {
            console.error("Cloudinary upload error:", error);
          }
        },
      );
    }
  }, [onUpload]);

  const openWidget = (e: React.MouseEvent) => {
    e.preventDefault();
    if (widgetRef.current) {
      widgetRef.current.open();
    }
  };

  return (
    <>
      <StyledButton type="button" onClick={openWidget}>
        {label || "Upload Image"}
      </StyledButton>

      {currentUrl && (
        <StyledPreviewContainer>
          <p>Image Preview:</p>
          <img
            src={currentUrl}
            alt="Uploaded Image"
            style={{ maxWidth: "200px" }}
          />
        </StyledPreviewContainer>
      )}
    </>
  );
};

export default CloudinaryImageWidget;
