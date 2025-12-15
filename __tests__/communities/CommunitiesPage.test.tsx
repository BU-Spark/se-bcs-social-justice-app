import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import CommunitiesPage from "@/app/(authenticated)/communities/page";

// Mock the SidebarContext
jest.mock("@/app/components/SidebarContext", () => {
  const originalModule = jest.requireActual("@/app/components/SidebarContext");
  return {
    ...originalModule,
    useSidebar: () => ({
      isExpanded: true,
      toggleSidebar: jest.fn(),
    }),
  };
});

// Mock the fetch function
const mockCommunities = {
  joinedCommunities: [
    {
      id: "1",
      name: "Community 1",
      description: "Description 1",
      imageUrl: "image1.jpg",
    },
    {
      id: "2",
      name: "Community 2",
      description: "Description 2",
      imageUrl: "image2.jpg",
    },
  ],
  recommendedCommunities: [
    {
      id: "3",
      name: "Community 3",
      description: "Description 3",
      imageUrl: "image3.jpg",
    },
    {
      id: "4",
      name: "Community 4",
      description: "Description 4",
      imageUrl: "image4.jpg",
    },
  ],
};

describe("CommunitiesPage", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock fetch for communities
    global.fetch = jest.fn().mockImplementation((url) => {
      if (url === "/api/communities") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommunities),
        });
      } else if (url === "/api/not-regmember") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ canCreateCommunity: true }),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });
  });

  it("displays joined communities after loading", async () => {
    await act(async () => {
      render(<CommunitiesPage />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Community 1")).toBeInTheDocument();
      expect(screen.getByText("Community 2")).toBeInTheDocument();
    });

    // Check if descriptions are rendered
    expect(screen.getByText("Description 1")).toBeInTheDocument();
    expect(screen.getByText("Description 2")).toBeInTheDocument();
  });

  it("displays recommended communities after loading", async () => {
    await act(async () => {
      render(<CommunitiesPage />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Community 3")).toBeInTheDocument();
      expect(screen.getByText("Community 4")).toBeInTheDocument();
    });

    // Check if descriptions are rendered
    expect(screen.getByText("Description 3")).toBeInTheDocument();
    expect(screen.getByText("Description 4")).toBeInTheDocument();
  });

  it("shows create community button when user has permission", async () => {
    await act(async () => {
      render(<CommunitiesPage />);
    });

    // Wait for permissions to load
    await waitFor(() => {
      expect(screen.getByText("Create Community")).toBeInTheDocument();
    });
  });

  it("handles joining a community", async () => {
    // Mock the join community API call
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === "/api/communities") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommunities),
        });
      } else if (url === "/api/not-regmember") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ canCreateCommunity: true }),
        });
      } else if (url === "/api/join-community" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });

    await act(async () => {
      render(<CommunitiesPage />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Community 3")).toBeInTheDocument();
    });

    // Find and click the Join button for Community 3
    const joinButtons = screen.getAllByText("Join");

    await act(async () => {
      fireEvent.click(joinButtons[0]);
    });

    // Verify that the fetch was called with the right parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: "3" }),
      });
    });
  });

  it("handles unjoining a community", async () => {
    // Mock the unjoin community API call
    global.fetch = jest.fn().mockImplementation((url, options) => {
      if (url === "/api/communities") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockCommunities),
        });
      } else if (url === "/api/not-regmember") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ canCreateCommunity: true }),
        });
      } else if (url === "/api/unjoin-community" && options.method === "POST") {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        });
      }
      return Promise.reject(new Error(`Unhandled fetch mock for URL: ${url}`));
    });

    await act(async () => {
      render(<CommunitiesPage />);
    });

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("Community 1")).toBeInTheDocument();
    });

    // Find and click the Unjoin button for Community 1
    const unjoinButtons = screen.getAllByText("Unjoin");

    await act(async () => {
      fireEvent.click(unjoinButtons[0]);
    });

    // Verify that the fetch was called with the right parameters
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/unjoin-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId: "1" }),
      });
    });
  });
});
