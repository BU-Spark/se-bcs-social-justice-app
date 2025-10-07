"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${({ isExpanded }) => (isExpanded ? "256px" : "64px")});
`;

const StyledContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const StyledCard = styled.div`
  border: 1px solid aliceblue;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StyledInterestTag = styled.span`
  padding: 4px 12px;
  border-radius: 12px;
  background: royalblue;
  color: white;
  font-size: 14px;
  margin-right: 8px;
  margin-bottom: 8px;
  display: inline-block;
`;

const StyledSearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid lightgray;
  border-radius: 4px;
  font-size: 14px;
  width: 300px;
  margin-bottom: 16px;
`;

type UserWithInterests = {
  id: string;
  name: string | null;
  email: string;
  username: string | null;
  imageUrl: string | null;
  phoneNumber: string | null;
  createdAt: string;
  interests: {
    userId: string;
    interestId: string;
    interest: {
      id: string;
      name: string;
    };
  }[];
};

export default function AdminUserInterest() {
  const { isExpanded } = useSidebar();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithInterests[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithInterests[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      } catch (error) {
        setIsAdmin(false);
        router.push("/dashboard");
      }
    };
    checkAdmin();
  }, [router]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/user-interest");
      if (!res.ok) {
        if (res.status === 403) {
          setError("You don't have permission to access this page.");
          router.push("/dashboard");
          return;
        }
        throw new Error(res.statusText);
      }
      const data = await res.json();
      setUsers(data.users);
      setFilteredUsers(data.users);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.interests.some((ui) =>
            ui.interest.name.toLowerCase().includes(query)
          )
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get all unique interests across all users
  const allInterests = Array.from(
    new Set(
      users.flatMap((user) =>
        user.interests.map((ui) => ui.interest.name)
      )
    )
  ).sort();

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        {isAdmin === null ? (
          <p>Loading...</p>
        ) : isAdmin === false ? (
          <p>Access Denied.</p>
        ) : (
          <>
            <StyledTitle>User Interests Dashboard</StyledTitle>
            {error && (
              <div
                style={{
                  background: "mistyrose",
                  border: "1px solid pink",
                  padding: "8px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "firebrick" }}>{error}</p>
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <p style={{ color: "darkslategray", marginBottom: "8px" }}>
                Total Users: <strong>{users.length}</strong> | All Interests:{" "}
                <strong>{allInterests.length}</strong>
              </p>
              <StyledSearchInput
                type="text"
                placeholder="Search by name, email, or interest..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {isLoading ? (
              <p>Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <p>
                {searchQuery
                  ? `No users found matching "${searchQuery}"`
                  : "No users found."}
              </p>
            ) : (
              filteredUsers.map((user) => (
                <StyledCard key={user.id}>
                  <StyledCardHeader>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      {user.imageUrl && (
                        <img
                          src={user.imageUrl}
                          alt={user.name || "User"}
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <div>
                        <h3 style={{ margin: 0, marginBottom: "4px" }}>
                          {user.name || "Anonymous User"}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "14px",
                            color: "darkslategray",
                          }}
                        >
                          {user.email}
                        </p>
                        {user.username && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: "12px",
                              color: "slategray",
                            }}
                          >
                            @{user.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <div style={{ fontSize: "12px", color: "gray" }}>
                      Joined: {formatDate(user.createdAt)}
                    </div>
                  </StyledCardHeader>

                  <div>
                    <p
                      style={{
                        fontSize: "14px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "darkslategray",
                      }}
                    >
                      Interests ({user.interests.length}):
                    </p>
                    {user.interests.length === 0 ? (
                      <p style={{ fontSize: "14px", color: "gray" }}>
                        No interests selected
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexWrap: "wrap" }}>
                        {user.interests.map((ui) => (
                          <StyledInterestTag key={ui.interestId}>
                            {ui.interest.name}
                          </StyledInterestTag>
                        ))}
                      </div>
                    )}
                  </div>

                  {user.phoneNumber && (
                    <div style={{ marginTop: "8px" }}>
                      <p style={{ fontSize: "14px", color: "darkslategray" }}>
                        <strong>Phone:</strong> {user.phoneNumber}
                      </p>
                    </div>
                  )}
                </StyledCard>
              ))
            )}

            {allInterests.length > 0 && (
              <div style={{ marginTop: "32px" }}>
                <h2 style={{ fontSize: "24px", marginBottom: "12px" }}>
                  All Interests in System
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                  {allInterests.map((interest) => {
                    const count = users.filter((u) =>
                      u.interests.some((ui) => ui.interest.name === interest)
                    ).length;
                    return (
                      <div
                        key={interest}
                        style={{
                          padding: "8px 16px",
                          background: "aliceblue",
                          borderRadius: "8px",
                          margin: "4px",
                          fontSize: "14px",
                        }}
                      >
                        <strong>{interest}</strong>
                        <span style={{ color: "slategray", marginLeft: "8px" }}>
                          ({count} {count === 1 ? "user" : "users"})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </StyledContainer>
    </StyledMainContent>
  );
}
