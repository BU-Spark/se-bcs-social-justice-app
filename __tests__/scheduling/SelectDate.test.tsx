import React from "react";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import SelectDatePage from "@/app/(authenticated)/scheduling/select-date/page";
import { useSearchParams, useRouter } from "next/navigation";

// Mock the useSearchParams and useRouter hooks
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock the SidebarContext
jest.mock("@/app/components/SidebarContext", () => {
  return {
    useSidebar: () => ({
      isExpanded: true,
      toggleSidebar: jest.fn(),
    }),
  };
});

describe("SelectDatePage", () => {
  const mockPush = jest.fn();
  const mockGet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet.mockReturnValue("1"), // Mocking the type query parameter
    });

    // Mock fetch for appointment type and available slots
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "/api/appointment-types/1") {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: "1",
              title: "One-on-One Coaching",
              description: "Personal coaching session",
              icon: "Person",
              accessType: "private",
            }),
        });
      } else if (url.includes("/api/available-slots")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                date: "2023-06-01",
                slots: [
                  { time: "09:00", available: true },
                  { time: "10:00", available: true },
                ],
              },
            ]),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });
  });

  it("renders the date selection page", async () => {
    await act(async () => {
      render(<SelectDatePage />);
    });

    // Check for page title
    await waitFor(() => {
      expect(screen.getByText("Select Date and Time")).toBeInTheDocument();
    });

    // Check for calendar description
    expect(
      screen.getByText("Choose when you'd like to schedule your meetings."),
    ).toBeInTheDocument();
  });

  it("displays the current month in the calendar", async () => {
    await act(async () => {
      render(<SelectDatePage />);
    });

    // Check that the calendar is showing a month
    await waitFor(() => {
      const monthElement = screen.getByText(/May 2025/);
      expect(monthElement).toBeInTheDocument();
    });
  });
});
