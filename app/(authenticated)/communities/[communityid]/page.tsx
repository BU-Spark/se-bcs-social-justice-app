"use client";

import { notFound } from "next/navigation";
import styled from "@emotion/styled";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";

async function getCommunityData(communityid: string) {
  const communities = [
    {
      id: "1",
      name: "Black Women in Academia",
      description:
        "Connect with other professionals on navigating being a WOC in academic spaces.",
      imageUrl: "https://i.postimg.cc/Kv7VQGHs/bwia.png",
    },
    {
      id: "2",
      name: "Be The Messenger",
      description:
        "Conversation on the Be the Messenger Framework established by Dr. Chad Starks.",
      imageUrl: "https://i.postimg.cc/YqBZ1GbW/btm.png",
    },
    {
      id: "3",
      name: "Encouraging Black Youth",
      description:
        "Learn how to empower Black youth to embrace their potential and shape a future of limitless possibilities.",
      imageUrl: "https://i.postimg.cc/264Fm6vs/image-4.png",
    },
    {
      id: "4",
      name: "Courageous Hearts",
      description:
        "Courageous Hearts and informed by Dr.Chad personal journey from overcoming systemic oppression to finding spiritual fulfilment, this package offers a transformative experience that integrates self-reflection, social justice, and personal empowerment.",
      imageUrl:
        "https://media-hosting.imagekit.io/6a8d11890fce436b/ch.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=mEpDoVjDF8~A4QhzA5HKNHXsCE6iPa~pIRBEQtLYTC0-kAhul1jSCBOhZXEuuYFdQwr10-9igxRPCSHo0DIL0uCyPfkkDzWsfBZE6mVOrgb9iwSZK1anywCqdHOSUoZ~INidZMiXIz6cxeoKvNZ3-xPMIqi6UwUQD71gp2sMIqIcJUp~AhqWeODAd5XXQgvo2qZBs6hGC231qsj9wo0b-~S8SihA1JShG1mi0vFYqnJSVQgrgZxz5QbsERyU0WQer~plcbxXYWXpxdS-Ox9sNgGGqHbftj9aYK8sZ~Lgtl2FazXAzJB9cNEZU7aMIebN1sol34G9WmJIhc-GkgJQFg__",
    },
    {
      id: "5",
      name: "Healthcare Justice",
      description:
        "Our mission is to create a healthcare system that serves everyone fairly and compassionately, regardless of their background or circumstances. Join us in our efforts to build a healthier, more just community where everyone has the opportunity to thrive.",
      imageUrl:
        "https://media-hosting.imagekit.io/5beaa53cd5434945/hj.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=gdiV0Fott~RoEYL1ADqqhR7uhDRM7cH1naBPqgowi9Cv5cCO00ua6rLC2THwxegorRi67AHsO1acEi68yt0KlOLRPyJzwYsxeVK1XA-apOfWCQ-54hKajSbZBOdBQPSElJLTCGF8SmgqCXMpxvFpcZ14c5csl310YKhamLhktitrigrbqanm6X6ZU7Q5~hitgj687JChb~WJhoyBekdbX2OEYxkfqOX~iV8IkeIfb3eA7M0NAdlYCRv559zTxI1I~SsrlQsYJKrwZeLXcKNGjqfnokj8o2JxbR2f83cxiC3XfvkNEDZDO2Bc6Nh58Q19zXgptCaN3FJiBvWDIMFq3w__",
    },
    {
      id: "6",
      name: "Boston Grassroots",
      description:
        "We tackle pressing issues in our neighborhood through collective action, fostering a sense of belonging and shared responsibility. By harnessing the power of local knowledge and passion, we're building a more resilient, inclusive, and vibrant community for all.",
      imageUrl:
        "https://media-hosting.imagekit.io/3d91312ec1704eae/bg.png?Expires=1837332054&Key-Pair-Id=K2ZIVPTIP2VGHC&Signature=uXHbbhVJCIsI92OY7Zafx5qSgm1HRIX--Cv5rqVMtYovYBaS6G67blNUdC-n9Z0kwYvbaw1ot6GRrT546lotatnmyv-5RMJxfzOSmlT1iK6d5xfnvrZnqpeEgyR5YnbQT-OoA7vgcTdfbgy1jEWAn155oM7KhrsAUVU7Gpdak8kRSn5la0Ym8U~Do0Rfi4aL5FG7suBsUk7B5dDP~EFZNkWcuji5pWM-lw1tsFN-34Zgz3u~bY17eWy3mU41frda9ve9-bxuZe0tk85Ryp7uoBcoct2Nw4R0Iob9h2AU1BdjvpT3vvSh51TJCuHHr7-C5pJ-RCVIDh5leiW8aWmYrQ__",
    },
  ];

  return communities.find((community) => community.id === communityid) || null;
}

const StyledContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const StyledSidebarContainer = styled.div`
  width: 220px;
  background-color: white;
  border-right: 1px solid black;
  padding: 16px;
`;

const StyledMainContent = styled.div`
  flex: 1;
  padding: 16px;
`;

const StyledHeader = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const StyledImage = styled.img`
  width: 280px;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
`;

const StyledText = styled.div`
  flex: 1;
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 12px;
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

export default async function CommunityPage({
  params,
}: {
  params: { communityid: string };
}) {
  const community = await getCommunityData(params.communityid);
  if (!community) {
    notFound();
  }
  return (
    <StyledContainer>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledMainContent>
        <StyledHeader>Welcome to the Community: {community.name}</StyledHeader>
        <StyledImage src={community.imageUrl} alt={community.name} />
        <StyledText>{community.description}</StyledText>
        <Link href="/dashboard" passHref>
          <StyledButton>Back</StyledButton>
        </Link>
      </StyledMainContent>
    </StyledContainer>
  );
}
