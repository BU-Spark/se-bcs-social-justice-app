"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 24px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${({ isExpanded }) => (isExpanded ? "256px" : "64px")});
  background: #f8f9fa;
  min-height: 100vh;
`;

const StyledContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
`;

const StyledHeader = styled.div`
  margin-bottom: 32px;
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const StyledSubtitle = styled.p`
  font-size: 14px;
  color: #6c757d;
  margin: 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ selected?: boolean }>`
  background: ${({ selected }) => (selected ? "#667eea" : "white")};
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid ${({ selected }) => (selected ? "#5568d3" : "#667eea")};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${({ selected }) => (selected ? "#5568d3" : "#f8f9fa")};
  }
`;

const StatValue = styled.div<{ selected?: boolean }>`
  font-size: 32px;
  font-weight: 700;
  color: ${({ selected }) => (selected ? "white" : "#1a1a1a")};
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ selected?: boolean }>`
  font-size: 12px;
  color: ${({ selected }) =>
    selected ? "rgba(255, 255, 255, 0.9)" : "#6c757d"};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

const ControlsContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 300px;
  padding: 10px 16px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

const FilterInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
`;

const ClearButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Thead = styled.thead`
  background: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
`;

const Th = styled.th`
  padding: 14px 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #495057;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #e9ecef;
  }
`;

const Tbody = styled.tbody``;

const Tr = styled.tr<{ clickable?: boolean }>`
  border-bottom: 1px solid #e9ecef;
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  transition: background 0.15s;

  &:hover {
    background: ${({ clickable }) => (clickable ? "#f8f9fa" : "transparent")};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Td = styled.td`
  padding: 14px 16px;
  font-size: 14px;
  color: #495057;
`;

const UserCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e9ecef;
`;

const AvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid #e9ecef;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: #6c757d;
`;

const CountBadge = styled.span`
  padding: 4px 10px;
  background: #667eea;
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #5568d3;
  }
`;

const Modal = styled.div<{ show: boolean }>`
  display: ${({ show }) => (show ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  padding: 24px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;

  &:hover {
    background: #f1f3f5;
    color: #1a1a1a;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ListItem = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
`;

const ItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ItemName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 15px;
`;

const CommunityCard = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
  display: flex;
  align-items: start;
  gap: 16px;
`;

const CommunityImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  border: 2px solid #e9ecef;
`;

const CommunityImagePlaceholder = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #e9ecef;
`;

const CommunityInfo = styled.div`
  flex: 1;
`;

const CommunityName = styled.div`
  font-weight: 600;
  color: #1a1a1a;
  font-size: 16px;
  margin-bottom: 4px;
`;

const CommunityType = styled.div`
  display: inline-block;
  padding: 4px 10px;
  background: #e9ecef;
  color: #495057;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const CommunityDescription = styled.div`
  font-size: 13px;
  color: #6c757d;
  line-height: 1.5;
`;

const UserListItem = styled.div`
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 12px;
  border: 1px solid #e9ecef;
`;

const UserListHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const UserDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid #dee2e6;
`;

const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const DetailLabel = styled.span`
  font-size: 11px;
  color: #6c757d;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.span`
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px;
  &::after {
    content: "";
    width: 40px;
    height: 40px;
    border: 3px solid #e9ecef;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

type Community = {
  id: string;
  name: string;
  type: string;
  imageUrl: string | null;
  description: string | null;
};

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
  communities?: Community[];
};

export default function AdminUserInterest() {
  const { isExpanded } = useSidebar();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<UserWithInterests[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithInterests[]>([]);
  const [allInterests, setAllInterests] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithInterests | null>(null);
  const [selectedInterest, setSelectedInterest] = useState<string | null>(null);
  const [filterByInterest, setFilterByInterest] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

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
        console.log(error);
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
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      // Extract and set all interests from the API response
      if (data.allInterests && Array.isArray(data.allInterests)) {
        setAllInterests(data.allInterests.map((interest: { name: string }) => interest.name).sort());
      }
      setError(null);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err instanceof Error ? err.message : "Failed to load users");
      setUsers([]);
      setFilteredUsers([]);
      setAllInterests([]);
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
    if (!users) {
      setFilteredUsers([]);
      return;
    }

    let filtered = users;

    // Filter by interest first
    if (filterByInterest) {
      filtered = filtered.filter((user) =>
        user.interests.some((ui) => ui.interest.name === filterByInterest)
      );
    }

    // Then apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.username?.toLowerCase().includes(query) ||
          user.interests.some((ui) =>
            ui.interest.name.toLowerCase().includes(query)) ||
          (user.communities &&
            user.communities.some((c) => c.name.toLowerCase().includes(query))),
      );
    }

    setFilteredUsers(filtered);
  }, [searchQuery, users, filterByInterest]);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const usersWithInterests = users.filter((u) => u.interests.length > 0).length;
  const usersInCommunity = users.filter(
    (u) => u.communities && u.communities.length > 0,
  ).length;

  const handleUserClick = (user: UserWithInterests) => {
    setSelectedUser(user);
    setSelectedInterest(null);
    setShowModal(true);
  };

  const handleInterestClick = (interest: string) => {
    setSelectedInterest(interest);
    setSelectedUser(null);
    setShowModal(true);
  };

  const handleInterestCardClick = (interest: string) => {
    if (filterByInterest === interest) {
      setFilterByInterest(null);
    } else {
      setFilterByInterest(interest);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setSelectedInterest(null);
  };

  const getUsersByInterest = (interest: string) => {
    if (!users || users.length === 0) return [];
    return users.filter((user) =>
      user.interests.some((ui) => ui.interest.name === interest)
    );
  };

  // Create interest stats for ALL interests, showing 0 for unused ones
  const interestStats = allInterests.map((interest) => ({
    name: interest,
    userCount: getUsersByInterest(interest).length,
  }));

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        {isAdmin === null ? (
          <LoadingSpinner />
        ) : isAdmin === false ? (
          <EmptyState>Access Denied</EmptyState>
        ) : (
          <>
            <StyledHeader>
              <StyledTitle>User Interests</StyledTitle>
              <StyledSubtitle>
                Click on an interest card to filter users by that interest
              </StyledSubtitle>
            </StyledHeader>

            <StatsGrid>
              {interestStats.map((stat) => (
                <StatCard
                  key={stat.name}
                  selected={filterByInterest === stat.name}
                  onClick={() => handleInterestCardClick(stat.name)}
                >
                  <StatValue selected={filterByInterest === stat.name}>
                    {stat.userCount}
                  </StatValue>
                  <StatLabel selected={filterByInterest === stat.name}>
                    {stat.name}
                  </StatLabel>
                </StatCard>
              ))}
            </StatsGrid>

            <ControlsContainer>
              <SearchInput
                type="text"
                placeholder="Search users, emails, interests, or communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {filterByInterest && (
                <FilterInfo>
                  Filtered by: {filterByInterest}
                  <ClearButton onClick={() => setFilterByInterest(null)}>
                    Clear
                  </ClearButton>
                </FilterInfo>
              )}
            </ControlsContainer>

            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <TableContainer>
                <Table>
                  <Thead>
                    <Tr>
                      <Th>User</Th>
                      <Th>Username</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                      <Th>Communities</Th>
                      <Th>Interests</Th>
                      <Th>Joined</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredUsers.length === 0 ? (
                      <Tr>
                        <Td colSpan={7}>
                          <EmptyState>No users found</EmptyState>
                        </Td>
                      </Tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <Tr
                          key={user.id}
                          clickable
                          onClick={() => handleUserClick(user)}
                        >
                          <Td>
                            <UserCell>
                              {user.imageUrl ? (
                                <Avatar
                                  src={user.imageUrl}
                                  alt={user.name || "User"}
                                />
                              ) : (
                                <AvatarPlaceholder>
                                  {getInitials(user.name)}
                                </AvatarPlaceholder>
                              )}
                              <UserInfo>
                                <UserName>{user.name || "Anonymous"}</UserName>
                              </UserInfo>
                            </UserCell>
                          </Td>
                          <Td>{user.username || "—"}</Td>
                          <Td>{user.email || "—"}</Td>
                          <Td>{user.phoneNumber || "—"}</Td>
                          <Td>
                            <CountBadge>
                              {user.communities?.length || 0}
                            </CountBadge>
                          </Td>
                          <Td>
                            <CountBadge>{user.interests.length}</CountBadge>
                          </Td>
                          <Td>{formatDate(user.createdAt)}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            )}

            <Modal show={showModal} onClick={closeModal}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>
                    {selectedUser
                      ? `${selectedUser.name || "Anonymous User"}'s Profile`
                      : `Users Interested in "${selectedInterest}"`}
                  </ModalTitle>
                  <CloseButton onClick={closeModal}>×</CloseButton>
                </ModalHeader>
                <ModalBody>
                  {selectedUser && (
                    <>
                      <Section>
                        <UserDetails
                          style={{ paddingTop: 0, borderTop: "none" }}
                        >
                          <DetailItem>
                            <DetailLabel>Email</DetailLabel>
                            <DetailValue>{selectedUser.email}</DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Phone</DetailLabel>
                            <DetailValue>
                              {selectedUser.phoneNumber || "Not provided"}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Username</DetailLabel>
                            <DetailValue>
                              {selectedUser.username || "Not set"}
                            </DetailValue>
                          </DetailItem>
                          <DetailItem>
                            <DetailLabel>Joined</DetailLabel>
                            <DetailValue>
                              {formatDate(selectedUser.createdAt)}
                            </DetailValue>
                          </DetailItem>
                        </UserDetails>
                      </Section>

                      <Section>
                        <SectionTitle>
                          Communities ({selectedUser.communities?.length || 0})
                        </SectionTitle>
                        {!selectedUser.communities ||
                        selectedUser.communities.length === 0 ? (
                          <EmptyState>Not in any communities</EmptyState>
                        ) : (
                          selectedUser.communities.map((community) => (
                            <CommunityCard key={community.id}>
                              {community.imageUrl ? (
                                <CommunityImage
                                  src={community.imageUrl}
                                  alt={community.name}
                                />
                              ) : (
                                <CommunityImagePlaceholder>
                                  {getInitials(community.name)}
                                </CommunityImagePlaceholder>
                              )}
                              <CommunityInfo>
                                <CommunityName>{community.name}</CommunityName>
                                <CommunityType>{community.type}</CommunityType>
                                {community.description && (
                                  <CommunityDescription>
                                    {community.description}
                                  </CommunityDescription>
                                )}
                              </CommunityInfo>
                            </CommunityCard>
                          ))
                        )}
                      </Section>

                      <Section>
                        <SectionTitle>
                          Interests ({selectedUser.interests.length})
                        </SectionTitle>
                        <ListContainer>
                          {selectedUser.interests.length === 0 ? (
                            <EmptyState>No interests selected</EmptyState>
                          ) : (
                            selectedUser.interests.map((ui) => (
                              <ListItem
                                key={ui.interestId}
                                onClick={() => {
                                  setSelectedUser(null);
                                  setSelectedInterest(ui.interest.name);
                                }}
                              >
                                <ItemHeader>
                                  <ItemName>{ui.interest.name}</ItemName>
                                  <span
                                    style={{
                                      color: "#667eea",
                                      fontSize: "12px",
                                    }}
                                  >
                                    View all users →
                                  </span>
                                </ItemHeader>
                              </ListItem>
                            ))
                          )}
                        </ListContainer>
                      </Section>
                    </>
                  )}

                  {selectedInterest && (
                    <div>
                      {getUsersByInterest(selectedInterest).length === 0 ? (
                        <EmptyState>No users have selected this interest yet</EmptyState>
                      ) : (
                        getUsersByInterest(selectedInterest).map((user) => (
                          <UserListItem key={user.id}>
                            <UserListHeader>
                              {user.imageUrl ? (
                                <Avatar
                                  src={user.imageUrl}
                                  alt={user.name || "User"}
                                />
                              ) : (
                                <AvatarPlaceholder>
                                  {getInitials(user.name)}
                                </AvatarPlaceholder>
                              )}
                              <div>
                                <UserName>
                                  {user.name || "Anonymous User"}
                                </UserName>
                                <UserEmail>{user.email}</UserEmail>
                              </div>
                            </UserListHeader>
                            <UserDetails>
                              <DetailItem>
                                <DetailLabel>Phone</DetailLabel>
                                <DetailValue>
                                  {user.phoneNumber || "Not provided"}
                                </DetailValue>
                              </DetailItem>
                              <DetailItem>
                                <DetailLabel>Username</DetailLabel>
                                <DetailValue>
                                  {user.username || "Not set"}
                                </DetailValue>
                              </DetailItem>
                              <DetailItem>
                                <DetailLabel>Communities</DetailLabel>
                                <DetailValue>
                                  {user.communities?.length || 0}
                                </DetailValue>
                              </DetailItem>
                              <DetailItem>
                                <DetailLabel>Total Interests</DetailLabel>
                                <DetailValue>{user.interests.length}</DetailValue>
                              </DetailItem>
                            </UserDetails>
                          </UserListItem>
                        ))
                      )}
                    </div>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>
          </>
        )}
      </StyledContainer>
    </StyledMainContent>
  );
}