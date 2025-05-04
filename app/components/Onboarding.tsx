"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";

const Onboarding = () => {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(true);
  const [step, setStep] = useState<number>(1);
  const [interestOptions, setInterestOptions] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    username: string;
    phoneNumber: string;
    ethnicity: string;
    interests: string[];
    referrer: string[];
    email: string;
  }>({
    username: "",
    phoneNumber: "",
    ethnicity: "",
    interests: [],
    referrer: [],
    email: "",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    if (!user) return;
    console.log(`user is: ${user}`);
    setFormData((prev) => ({
      ...prev,
      email: user?.emailAddresses[0]?.emailAddress || "",
    }));

    // Fetch interests from API
    async function fetchInterests() {
      try {
        const response = await fetch("/api/interests");
        if (response.ok) {
          const data = await response.json();
          setInterestOptions(data.map((item: { name: string }) => item.name));
        } else {
          console.error("Failed to fetch interests");
        }
      } catch (error) {
        console.error("Error fetching interests:", error);
      }
    }

    fetchInterests();
  }, [user]);

  const validatePhoneNumber = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const handleNext = () => {
    // Example validation for step 2
    if (step === 2) {
      const newErrors: { [key: string]: string } = {};
      if (!formData.username) newErrors.username = "Username is required";
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (!validatePhoneNumber(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid phone number";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
    }

    setStep((prev) => prev + 1);
  };
  const handleBack = () => setStep((prev) => prev - 1);
  const handleChange = (
    key: keyof typeof formData,
    value: string | string[],
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      console.log(`form-data is: ${JSON.stringify(formData)}`);
      const response = await fetch("/api/update-user", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        console.log("User data updated successfully.");
        setIsOpen(false);
      } else {
        console.error("Failed to update user.");
      }
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (confirm("Are you sure you want to exit? Your progress will be lost.")) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-[600px] h-[500px] md:w-[700px] md:h-[550px] lg:w-[700px] lg:h-[550px] flex flex-col relative">
        <div className="absolute top-4 w-full px-6 flex justify-between items-center">
          {/* Step Indicator - Only visible for steps 2, 3, and 4 */}
          {step > 1 && step < 5 ? (
            <span className="text-blue-600 font-bold text-md">
              Step {step - 1}/3
            </span>
          ) : (
            <div></div> // Empty div to maintain layout consistency
          )}

          {/* Close Button - Always stays on the right */}
          <button
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* Content area with fixed height to allow for scrolling if needed */}
        <div className="flex-1 p-12 overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col h-full">
              {/* Header Section */}
              <div className="flex justify-between items-start w-full">
                <div className="flex items-center space-x-4 w-full">
                  <img
                    src="/logo.png"
                    alt="Onboarding Logo"
                    className="rounded-lg w-20"
                  />
                  <h2 className="text-lg font-bold w-full">
                    Welcome to Be The Messenger.
                    <br />
                    Meet the Messenger!
                  </h2>
                </div>
              </div>
              {/* Image & Description */}
              <div className="mt-8 flex space-x-4 ml-12">
                <Image
                  src="/messenger.jpg"
                  alt="Messenger"
                  width={100}
                  height={100}
                  className="rounded-lg w-64 h-64 object-cover"
                />
                <p className="text-gray-600 text-sm p-12 text-center">
                  Dr. Brian Chad Starks is a change maker in the field of social
                  justice. As the CEO and founder of BCS and Associates, he
                  strives to empower others in the fight against systemic
                  inequalities. He invites you to join this platform and be a
                  catalyst for transformation!
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="mt-3">
              <h2 className="text-xl font-bold text-center">
                Tell us more about yourself.
              </h2>
              <p className="text-gray-500 text-center text-sm">
                Choose the ideal interests so we can help you connect with the
                right
                <br />
                people and personalize your content.
              </p>
              <div className="mt-6">
                <label className="block text-sm font-medium">
                  Choose your username?
                </label>
                <input
                  type="text"
                  className={`w-full border p-2 rounded mt-1 ${errors.username ? "border-red-500" : ""}`}
                  value={formData.username}
                  onChange={(e) => handleChange("username", e.target.value)}
                />
                {errors.username && (
                  <p className="text-red-500 text-xs mt-1">{errors.username}</p>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">
                  What is your phone number?
                </label>
                <input
                  type="tel"
                  className={`w-full border p-2 rounded mt-1 ${errors.phoneNumber ? "border-red-500" : ""}`}
                  placeholder="1234567890"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium">
                  Which race/ethnicity best describes you?
                </label>
                <select
                  className="w-full border p-2 rounded mt-1 bg-white"
                  value={formData.ethnicity || ""}
                  onChange={(e) => handleChange("ethnicity", e.target.value)}
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  {ethnicityOptions.map((ethnicity) => (
                    <option key={ethnicity} value={ethnicity}>
                      {ethnicity}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mt-3">
              <h2 className="text-xl font-bold text-center">
                How did you hear about us?
              </h2>
              <p className="text-gray-500 text-center text-sm">
                Please let us know how you bumped into us!
                <br />
                (Check all that apply)*
              </p>
              <div className="flex justify-center items-center h-full">
                <div className="grid grid-cols-2 gap-4 mt-16">
                  {referralOptions.map((option) => (
                    <label key={option} className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        onChange={(e) => {
                          const updatedReferrer = e.target.checked
                            ? [...formData.referrer, option]
                            : formData.referrer.filter(
                                (item) => item !== option,
                              );
                          handleChange("referrer", updatedReferrer);
                        }}
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="mt-3">
              <h2 className="text-xl font-bold text-center">
                Choose your interests
              </h2>
              <p className="text-gray-500 text-center text-sm">
                Select your preferred topics.
              </p>
              <div className="mt-12 flex flex-wrap gap-2">
                {interestOptions.length > 0 ? (
                  interestOptions.map((interest) => (
                    <button
                      key={interest}
                      className={`px-4 py-2 border rounded ${
                        formData.interests.includes(interest)
                          ? "bg-black text-white"
                          : "bg-gray-200"
                      }`}
                      onClick={() => {
                        const updatedInterests = formData.interests.includes(
                          interest,
                        )
                          ? formData.interests.filter(
                              (item) => item !== interest,
                            )
                          : [...formData.interests, interest];
                        handleChange("interests", updatedInterests);
                      }}
                    >
                      {interest}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500">Loading interests...</p>
                )}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="text-center mt-3">
              <h2 className="text-xl font-bold">
                It&apos;s time to be the messenger.
              </h2>
              <p className="text-gray-500 text-center text-sm">
                Your account has been set up. Taking you to the homepage.
              </p>
              <div className="mt-12 flex items-center justify-center w-full">
                <img
                  src="/get_started.png"
                  alt="Getting Started"
                  className="w-60 h-auto object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Fixed button area at the bottom */}
        <div className="p-6 border-t">
          <div className="flex justify-between items-center">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 5 ? (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {"Next"}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={`px-4 py-2 bg-blue-600 text-white rounded ${
                  isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Confirm"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
