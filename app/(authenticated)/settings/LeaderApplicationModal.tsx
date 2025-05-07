"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { Dialog } from "@headlessui/react";

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const StyledModalContent = styled.div`
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
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

const StyledSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 16px;
  background-color: white;

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

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderApplicationModal({ isOpen, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    location: "",

    // Experience & Background
    currentlyInvolved: "no",
    background: "",
    hasLedGroup: "no",
    previousRole: "",
    focusTopics: "",
    motivation: "",

    // Leadership Approach
    leadershipStyle: "",
    inclusiveEnvironment: "",
    conflictHandling: "",
    comfortableWithTopics: "no",
    engagementStrategies: "",

    // Commitment & Availability
    meetingFrequency: "weekly",
    availableForOnboarding: "no",
    willFollowGuidelines: "no",
    questions: "",

    // References & Agreement
    referenceName: "",
    referenceContact: "",
    referenceRelationship: "",
    videoUrl: "",
    agreementChecked: false,
  });

  const updateFormData = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Full Name
                </label>
                <StyledInput
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email Address
                </label>
                <StyledInput
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number
                </label>
                <StyledInput
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Location (City, Country)
                </label>
                <StyledInput
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">Experience & Background</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Are you currently involved in social justice work?
                </label>
                <StyledSelect
                  value={formData.currentlyInvolved}
                  onChange={(e) =>
                    updateFormData("currentlyInvolved", e.target.value)
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </StyledSelect>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Background in social justice, coaching, or community
                  organizing
                </label>
                <StyledTextArea
                  value={formData.background}
                  onChange={(e) => updateFormData("background", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Have you led a community group before?
                </label>
                <StyledSelect
                  value={formData.hasLedGroup}
                  onChange={(e) =>
                    updateFormData("hasLedGroup", e.target.value)
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </StyledSelect>
              </div>
              {formData.hasLedGroup === "yes" && (
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Describe your previous role and group
                  </label>
                  <StyledTextArea
                    value={formData.previousRole}
                    onChange={(e) =>
                      updateFormData("previousRole", e.target.value)
                    }
                  />
                </div>
              )}
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  What topics or issues would your group focus on?
                </label>
                <StyledTextArea
                  value={formData.focusTopics}
                  onChange={(e) =>
                    updateFormData("focusTopics", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Why do you want to lead a group in this community?
                </label>
                <StyledTextArea
                  value={formData.motivation}
                  onChange={(e) => updateFormData("motivation", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Group Leadership Approach
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  What leadership style do you bring to community discussions?
                </label>
                <StyledTextArea
                  value={formData.leadershipStyle}
                  onChange={(e) =>
                    updateFormData("leadershipStyle", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  How would you foster an inclusive and respectful environment?
                </label>
                <StyledTextArea
                  value={formData.inclusiveEnvironment}
                  onChange={(e) =>
                    updateFormData("inclusiveEnvironment", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  How do you handle conflicts within a group?
                </label>
                <StyledTextArea
                  value={formData.conflictHandling}
                  onChange={(e) =>
                    updateFormData("conflictHandling", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Are you comfortable facilitating difficult discussions on
                  social justice topics?
                </label>
                <StyledSelect
                  value={formData.comfortableWithTopics}
                  onChange={(e) =>
                    updateFormData("comfortableWithTopics", e.target.value)
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </StyledSelect>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  What strategies would you use to keep members engaged?
                </label>
                <StyledTextArea
                  value={formData.engagementStrategies}
                  onChange={(e) =>
                    updateFormData("engagementStrategies", e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">
              Commitment & Availability
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  How frequently would you like to hold group discussions?
                </label>
                <StyledSelect
                  value={formData.meetingFrequency}
                  onChange={(e) =>
                    updateFormData("meetingFrequency", e.target.value)
                  }
                >
                  <option value="weekly">Weekly</option>
                  <option value="biweekly">Biweekly</option>
                  <option value="monthly">Monthly</option>
                </StyledSelect>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Are you available for a short onboarding session before
                  starting?
                </label>
                <StyledSelect
                  value={formData.availableForOnboarding}
                  onChange={(e) =>
                    updateFormData("availableForOnboarding", e.target.value)
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </StyledSelect>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Are you willing to follow community guidelines and moderation
                  policies?
                </label>
                <StyledSelect
                  value={formData.willFollowGuidelines}
                  onChange={(e) =>
                    updateFormData("willFollowGuidelines", e.target.value)
                  }
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </StyledSelect>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Do you have any questions or concerns about leading a group?
                </label>
                <StyledTextArea
                  value={formData.questions}
                  onChange={(e) => updateFormData("questions", e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold mb-6">References & Agreement</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reference Name
                </label>
                <StyledInput
                  type="text"
                  value={formData.referenceName}
                  onChange={(e) =>
                    updateFormData("referenceName", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Reference Contact Information
                </label>
                <StyledInput
                  type="text"
                  value={formData.referenceContact}
                  onChange={(e) =>
                    updateFormData("referenceContact", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Relationship to Reference
                </label>
                <StyledInput
                  type="text"
                  value={formData.referenceRelationship}
                  onChange={(e) =>
                    updateFormData("referenceRelationship", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Video Introduction URL (Optional)
                </label>
                <StyledInput
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => updateFormData("videoUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.agreementChecked}
                  onChange={(e) =>
                    updateFormData("agreementChecked", e.target.checked)
                  }
                  className="h-4 w-4 text-blue-600"
                />
                <label className="text-sm text-gray-700">
                  I agree to uphold the community guidelines and understand that
                  failure to do so may result in my removal as a group leader.
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      currentlyInvolved: formData.currentlyInvolved === "yes",
      background: formData.background,
      hasLedGroup: formData.hasLedGroup === "yes",
      previousRole: formData.previousRole,
      focusTopics: formData.focusTopics,
      motivation: formData.motivation,
      leadershipStyle: formData.leadershipStyle,
      inclusiveEnvironment: formData.inclusiveEnvironment,
      conflictHandling: formData.conflictHandling,
      comfortableWithTopics: formData.comfortableWithTopics === "yes",
      engagementStrategies: formData.engagementStrategies,
      meetingFrequency: formData.meetingFrequency,
      availableForOnboarding: formData.availableForOnboarding === "yes",
      willFollowGuidelines: formData.willFollowGuidelines === "yes",
      questions: formData.questions,
      referenceName: formData.referenceName,
      referenceContact: formData.referenceContact,
      referenceRelationship: formData.referenceRelationship,
      videoUrl: formData.videoUrl,
    };

    try {
      const res = await fetch("/api/leader-applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error submitting application:", await res.text());
        return;
      }

      console.log("Application submitted successfully!");
      onClose();
    } catch (error) {
      console.error("Error submitting application:", error);
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.fullName.trim() !== "" &&
          formData.email.trim() !== "" &&
          formData.phone.trim() !== "" &&
          formData.location.trim() !== ""
        );
      case 2:
        return (
          formData.background.trim() !== "" &&
          formData.focusTopics.trim() !== "" &&
          formData.motivation.trim() !== "" &&
          (formData.hasLedGroup === "no" || formData.previousRole.trim() !== "")
        );
      case 3:
        return (
          formData.leadershipStyle.trim() !== "" &&
          formData.inclusiveEnvironment.trim() !== "" &&
          formData.conflictHandling.trim() !== "" &&
          formData.engagementStrategies.trim() !== ""
        );
      case 4:
        return (
          formData.meetingFrequency !== "" &&
          formData.availableForOnboarding !== "" &&
          formData.willFollowGuidelines !== ""
        );
      case 5:
        return (
          formData.referenceName.trim() !== "" &&
          formData.referenceContact.trim() !== "" &&
          formData.referenceRelationship.trim() !== "" &&
          formData.agreementChecked
        );
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <StyledModal>
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-3xl rounded bg-white">
            <StyledModalContent>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Leader Application</h2>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <div className="flex justify-between mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <div
                      key={s}
                      className={`w-1/5 h-2 rounded ${
                        s <= step ? "bg-blue-500" : "bg-gray-200"
                      } mx-1`}
                    />
                  ))}
                </div>
                <p className="text-center text-gray-600">Step {step} of 5</p>
              </div>

              {renderStep()}

              <div className="flex justify-between mt-8">
                {step > 1 && (
                  <StyledButton
                    onClick={() => setStep(step - 1)}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Previous
                  </StyledButton>
                )}
                {step < 5 ? (
                  <StyledButton
                    onClick={() => setStep(step + 1)}
                    disabled={!isStepValid()}
                    className={step === 1 ? "ml-auto" : ""}
                  >
                    Next
                  </StyledButton>
                ) : (
                  <StyledButton
                    onClick={handleSubmit}
                    disabled={!isStepValid()}
                    className={step === 1 ? "ml-auto" : ""}
                  >
                    Submit Application
                  </StyledButton>
                )}
              </div>
            </StyledModalContent>
          </Dialog.Panel>
        </div>
      </Dialog>
    </StyledModal>
  );
}
