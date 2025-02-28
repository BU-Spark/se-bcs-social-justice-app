"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

interface FormData {
  email: string;
  phone: string;
  ethnicity: string[];
  interests: string[];
  referrer: string[];
}

const Onboarding = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    phone: "",
    ethnicity: [],
    interests: ["Social Justice"],
    referrer: [],
  });

  const ethnicityOptions: string[] = [
    "American Indian",
    "Black",
    "Hispanic",
    "Pacific Islander",
    "Asian",
    "White",
  ];
  const referralOptions: string[] = [
    "Google",
    "Word of Mouth",
    "Podcast",
    "Social Media",
    "Company Website",
    "Event",
    "Advertisement",
    "Referral",
  ];
  const interestOptions: string[] = [
    "Social Justice",
    "Environmental Justice",
    "Racial Justice",
    "Culture",
    "Diversity",
    "Education",
  ];

  useEffect(() => {
    // Show onboarding modal only for first-time users
    const isNewUser = localStorage.getItem("isNewUser");
    if (!isNewUser && user) {
      setIsOpen(true);
    }
  }, [user]);

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);
  const handleChange = (key: keyof FormData, value: string | string[]) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    // Save data and prevent modal from showing again
    localStorage.setItem("isNewUser", "false");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white p-12 rounded-lg shadow-lg w-[600px] h-[500px] md:w-[700px] md:h-[550px] lg:w-[700px] lg:h-[550px] flex flex-col justify-between">
        {/* Close Button */}
        <button
          className="text-gray-500 hover:text-gray-800 text-xl font-bold"
          onClick={() => setIsOpen(false)}
        >
          ×
        </button>
        {step === 1 && (
          <div className="p-6 flex flex-col h-full">
            {/* Header Section */}
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <img
                  src="/logo.png"
                  alt="Onboarding Logo"
                  className="rounded-lg w-16"
                />
                <h2 className="text-lg font-bold">
                  Welcome to Be The Messenger.
                  <br />
                  Meet the Messenger!
                </h2>
              </div>
            </div>
            {/* Image & Description */}
            <div className="mt-4 flex space-x-4">
              <Image
                src="/messenger.jpg"
                alt="Messenger"
                width={100}
                height={100}
                className="rounded-lg w-64 h-64 object-cover"
              />
              <p className="text-gray-600 text-sm">
                Dr. Brian Chad Starks is a change maker in the field of social
                justice. As the CEO and founder of BCS and Associates, he
                strives to empower others in the fight against systemic
                inequalities. He invites you to join this platform and be a
                catalyst for transformation!
              </p>
            </div>
            {/* Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-center">
              Tell us more about yourself.
            </h2>
            <p className="text-gray-600 text-center">
              Choose ideal interests to personalize your content.
            </p>
            <div className="mt-4">
              <label className="block text-sm font-medium">
                What is your email address?
              </label>
              <input
                type="email"
                className="w-full border p-2 rounded mt-1"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">
                What is your phone number?
              </label>
              <input
                type="tel"
                className="w-full border p-2 rounded mt-1"
                placeholder="(123) - 456 - 7890"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium">
                Which race(s)/ethnicities best describe you?
              </label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {ethnicityOptions.map((ethnicity) => (
                  <label
                    key={ethnicity}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      onChange={(e) => {
                        const updatedEthnicity = e.target.checked
                          ? [...formData.ethnicity, ethnicity]
                          : formData.ethnicity.filter(
                              (item) => item !== ethnicity,
                            );
                        handleChange("ethnicity", updatedEthnicity);
                      }}
                    />
                    <span>{ethnicity}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-center">
              How did you hear about us?
            </h2>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {referralOptions.map((option) => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    onChange={(e) => {
                      const updatedReferrer = e.target.checked
                        ? [...formData.referrer, option]
                        : formData.referrer.filter((item) => item !== option);
                      handleChange("referrer", updatedReferrer);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold text-center">
              Choose your interests
            </h2>
            <p className="text-gray-600 text-center">
              Select your preferred topics.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {interestOptions.map((interest) => (
                <button
                  key={interest}
                  className={`px-4 py-2 border rounded ${formData.interests.includes(interest) ? "bg-black text-white" : "bg-gray-200"}`}
                  onClick={() => {
                    const updatedInterests = formData.interests.includes(
                      interest,
                    )
                      ? formData.interests.filter((item) => item !== interest)
                      : [...formData.interests, interest];
                    handleChange("interests", updatedInterests);
                  }}
                >
                  {interest}
                </button>
              ))}
            </div>
            <div className="mt-6 flex justify-between">
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="text-center">
            <h2 className="text-xl font-bold">
              It’s time to be the messenger.
            </h2>
            <p>Your account has been set up. Taking you to the homepage.</p>
            <button
              onClick={handleSubmit}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Confirm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
