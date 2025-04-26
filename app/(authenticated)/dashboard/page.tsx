"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../../components/SidebarContext";
import Link from "next/link";
import { format } from "date-fns";

const mockData = {
  communities: [
    {
      id: 1,
      imageUrl: "https://i.postimg.cc/Kv7VQGHs/bwia.png",
      name: "Black Women in Academia",
      type: "Affinity Group",
      description:
        "Connect with other professionals on navigating being a WOC in academic spaces.",
      members: 0,
    },
    {
      id: 2,
      imageUrl: "https://i.postimg.cc/YqBZ1GbW/btm.png",
      name: "Be The Messenger",
      type: "Book Club",
      description:
        "Conversation on the Be the Messenger Framework established by Dr. Chad Starks.",
      members: 0,
    },
    {
      id: 3,
      imageUrl: "https://i.postimg.cc/264Fm6vs/image-4.png",
      name: "Encouraging Black Youth",
      type: "K-12",
      description:
        "Learn how to empower Black youth to embrace their potential and shape a future of limitless possibilities.",
      members: 0,
    },
  ],
  recommendedGroups: [
    {
      id: 4,
      name: "Courageous Hearts",
      description:
        "Courageous Hearts and informed by Dr.Chad personal journey from overcoming systemic oppression to finding spiritual fulfilment, this package offers a transformative experience that integrates self-reflection, social justice, and personal empowerment.",
      imageUrl:
        "https://media-hosting.imagekit.io//6a8d11890fce436b/ch.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=mEpDoVjDF8~A4QhzA5HKNHXsCE6iPa~pIRBEQtLYTC0-kAhul1jSCBOhZXEuuYFdQwr10-9igxRPCSHo0DIL0uCyPfkkDzWsfBZE6mVOrgb9iwSZK1anywCqdHOSUoZ~INidZMiXIz6cxeoKvNZ3-xPMIqi6UwUQD71gp2sMIqIcJUp~AhqWeODAd5XXQgvo2qZBs6hGC231qsj9wo0b-~S8SihA1JShG1mi0vFYqnJSVQgrgZxz5QbsERyU0WQer~plcbxXYWXpxdS-Ox9sNgGGqHbftj9aYK8sZ~Lgtl2FazXAzJB9cNEZU7aMIebN1sol34G9WmJIhc-GkgJQFg__",
    },
    {
      id: 5,
      name: "Healthcare Justice",
      description:
        "Our mission is to create a healthcare system that serves everyone fairly and compassionately, regardless of their background or circumstances. Join us in our efforts to build a healthier, more just community where everyone has the opportunity to thrive.",
      imageUrl:
        "https://media-hosting.imagekit.io//5beaa53cd5434945/hj.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=gdiV0Fott~RoEYL1ADqqhR7uhDRM7cH1naBPqgowi9Cv5cCO00ua6rLC2THwxegorRi67AHsO1acEi68yt0KlOLRPyJzwYsxeVK1XA-apOfWCQ-54hKajSbZBOdBQPSElJLTCGF8SmgqCXMpxvFpcZ14c5csl310YKhamLhktitrigrbqanm6X6ZU7Q5~hitgj687JChb~WJhoyBekdbX2OEYxkfqOX~iV8IkeIfb3eA7M0NAdlYCRv559zTxI1I~SsrlQsYJKrwZeLXcKNGjqfnokj8o2JxbR2f83cxiC3XfvkNEDZDO2Bc6Nh58Q19zXgptCaN3FJiBvWDIMFq3w__",
    },
    {
      id: 6,
      name: "Boston Grassroots",
      description:
        "We tackle pressing issues in our neighborhood through collective action, fostering a sense of belonging and shared responsibility. By harnessing the power of local knowledge and passion, we're building a more resilient, inclusive, and vibrant community for all.",
      imageUrl:
        "https://media-hosting.imagekit.io//3d91312ec1704eae/bg.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uXHbbhVJCIsI92OY7Zafx5qSgm1HRIX--Cv5rqVMtYovYBaS6G67blNUdC-n9Z0kwYvbaw1ot6GRrT546lotatnmyv-5RMJxfzOSmlT1iK6d5xfnvrZnqpeEgyR5YnbQT-OoA7vgcTdfbgy1jEWAn155oM7KhrsAUVU7Gpdak8kRSn5la0Ym8U~Do0Rfi4aL5FG7suBsUk7B5dDP~EFZNkWcuji5pWM-lw1tsFN-34Zgz3u~bY17eWy3mU41frda9ve9-bxuZe0tk85Ryp7uoBcoct2Nw4R0Iob9h2AU1BdjvpT3vvSh51TJCuHHr7-C5pJ-RCVIDh5leiW8aWmYrQ__",
    },
  ],
};

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const StyledSection = styled.section`
  margin-bottom: 28px;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: white;
  gap: 12px;
`;

const StyledImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
`;

const StyledHeader = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const StyledText = styled.div`
  flex: 1;
`;

const StyledButton = styled.button`
  padding: 12px 22px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: red;
  }
`;

// Interface for appointment data
interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  locationOrLink?: string;
  appointmentType: {
    id: string;
    title: string;
    description?: string;
    icon: string;
  };
  host: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  attendees: Array<{
    id: string;
    email: string;
  }>;
}

const DashboardPage = () => {
  const { user } = useUser();
  const { isExpanded } = useSidebar();
  const [publicAppointments, setPublicAppointments] = useState<Appointment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments/public");
        if (!response.ok) {
          throw new Error("Failed to fetch public appointments");
        }
        const data = await response.json();
        setPublicAppointments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicAppointments();
  }, []);

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader>Welcome, {user?.fullName}</StyledHeader>
      <p>Here are your communities and recommendations.</p>
      <br />

      <StyledSection>
        <StyledHeader>Public Events & Seminars</StyledHeader>
        {isLoading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : publicAppointments.length === 0 ? (
          <p>No public events available at the moment.</p>
        ) : (
          publicAppointments.map((appointment) => (
            <StyledDiv key={appointment.id}>
              {appointment.host.imageUrl ? (
                <StyledImage
                  src={appointment.host.imageUrl}
                  alt={`${appointment.appointmentType.title} event`}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: "#e2e8f0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {appointment.appointmentType.icon}
                </div>
              )}
              <StyledText>
                <strong>{appointment.appointmentType.title}</strong>
                <p>{appointment.appointmentType.description}</p>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#718096",
                    marginTop: "4px",
                  }}
                >
                  <div>Host: {appointment.host.name}</div>
                  <div>
                    When:{" "}
                    {format(
                      new Date(appointment.startTime),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </div>
                  <div>Attendees: {appointment.attendees.length}</div>
                </div>
              </StyledText>
              <Link href={`/appointments/${appointment.id}`} passHref>
                <StyledButton>View Details</StyledButton>
              </Link>
            </StyledDiv>
          ))
        )}
      </StyledSection>

      <StyledSection>
        <StyledHeader>My Communities</StyledHeader>
        {mockData.communities.map((community) => (
          <StyledDiv key={community.id}>
            <StyledImage src={community.imageUrl} alt={community.name} />
            <StyledText>
              <strong>{community.name}</strong>
              <p>{community.description}</p>
            </StyledText>
            <Link href={`/communities/${community.id}`} passHref>
              <StyledButton>View</StyledButton>
            </Link>
          </StyledDiv>
        ))}
      </StyledSection>
      <StyledSection>
        <StyledHeader>Recommended Communities</StyledHeader>
        {mockData.recommendedGroups.map((group) => (
          <StyledDiv key={group.id}>
            <StyledImage src={group.imageUrl} alt={group.name} />
            <StyledText>
              <strong>{group.name}</strong>
              <p>{group.description}</p>
            </StyledText>
            <Link href={`/communities/${group.id}`} passHref>
              <StyledButton>View</StyledButton>
            </Link>
          </StyledDiv>
        ))}
      </StyledSection>
    </StyledMainContent>
  );
};

export default DashboardPage;
