"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../components/SidebarContext";
import LeaderApplicationModal from "./LeaderApplicationModal";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const StyledContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
`;

const StyledSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const StyledTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const StyledSubtitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const StyledButton = styled.button`
  background: #4299e1;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #2b6cb0;
  }
`;

export default function Settings() {
  const { isExpanded } = useSidebar();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [affiliation, setAffiliation] = useState("");
  const [biography, setBiography] = useState("");

  const handleSaveProfile = () => {
    // TODO: Implement profile saving logic
    console.log("Saving profile...");
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Settings</StyledTitle>

        <StyledSection>
          <StyledSubtitle>Profile Information</StyledSubtitle>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Affiliation
            </label>
            <StyledInput
              type="text"
              placeholder="Add your affiliation here..."
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Biography
            </label>
            <StyledTextArea
              placeholder="Add your biography here..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
            />
          </div>

          <StyledButton onClick={handleSaveProfile}>Save Profile</StyledButton>
        </StyledSection>

        <StyledSection>
          <StyledSubtitle>Leadership Application</StyledSubtitle>
          <p className="text-gray-600 mb-4">
            Want to make a bigger impact? Apply to become a community leader and
            help guide meaningful discussions.
          </p>
          <StyledButton
            onClick={() => setIsModalOpen(true)}
            className="bg-green-500 hover:bg-green-600"
          >
            Request to Become a Leader
          </StyledButton>
        </StyledSection>

        <LeaderApplicationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </StyledContainer>
    </StyledMainContent>
  );
}
