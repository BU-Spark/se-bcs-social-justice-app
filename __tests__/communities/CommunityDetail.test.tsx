import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import CommunityPage from "@/app/(authenticated)/communities/[communityid]/page";

// Mock the BlogPostsSection component
jest.mock("@/app/components/BlogPostsSection", () => {
  return function MockBlogPostsSection() {
    return <div data-testid="blog-posts-section">Blog Posts Section</div>;
  };
});

// Mock the Sidebar component
jest.mock("@/app/components/Sidebar", () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

describe("CommunityPage", () => {
  const mockCommunity = {
    id: "community-1",
    name: "Test Community",
    description: "This is a test community description",
    imageUrl: "test-image.jpg",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock fetch for community data
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url.includes("/api/communities/")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommunity),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });
  });

  it("displays community details after loading", async () => {
    await act(async () => {
      render(<CommunityPage params={{ communityid: "community-1" }} />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.getByText(/Welcome to the Community: Test Community/),
      ).toBeInTheDocument();
    });

    // Check if description is rendered
    expect(
      screen.getByText("This is a test community description"),
    ).toBeInTheDocument();

    // Check if image is rendered with correct src
    const image = screen.getByAltText("Test Community");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "test-image.jpg");

    // Check if back button is rendered
    expect(screen.getByText("Back")).toBeInTheDocument();

    // Check if blog posts section is rendered
    expect(screen.getByTestId("blog-posts-section")).toBeInTheDocument();
  });

  it("uses default image when imageUrl is null", async () => {
    // Mock community with null imageUrl
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            ...mockCommunity,
            imageUrl: null,
          }),
      });
    });

    await act(async () => {
      render(<CommunityPage params={{ communityid: "community-1" }} />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(
        screen.getByText(/Welcome to the Community: Test Community/),
      ).toBeInTheDocument();
    });

    // Check if image is rendered with default src
    const image = screen.getByAltText("Test Community");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/default-image.jpg");
  });

  it("handles API error gracefully", async () => {
    // Mock a failed API call
    global.fetch = jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ok: false,
        status: 404,
      });
    });

    render(<CommunityPage params={{ communityid: "invalid-id" }} />);

    // Wait a moment to ensure the component has time to handle the error
    await waitFor(() => {
      // The component should handle the error gracefully
      expect(
        screen.queryByText(/Welcome to the Community/),
      ).not.toBeInTheDocument();
    });
  });
});
