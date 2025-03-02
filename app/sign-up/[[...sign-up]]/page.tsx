"use client";

import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackgroundImage = styled(Image)`
  object-fit: cover;
`;

const MicrophoneIcon = styled.div`
  position: absolute;
  top: 5%;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
`;

const SignInContainer = styled.div`
  background-color: white;
  padding: 3vw 2vw;
  border-radius: 1vw;
  box-shadow: 0 0.4vw 0.8vw black;
  text-align: center;
  width: 80vw;
  max-width: 40vw;
  z-index: 1;

  @media (min-width: 768px) {
    max-width: 35vw;
  }

  @media (min-width: 1024px) {
    max-width: 30vw;
  }
`;


export default function Page() {
  return (
    <Container>
      <BackgroundImage
        src="/signin.png"
        alt="Background Image"
        layout="fill"
        quality={100}
      />

      <MicrophoneIcon>
        <Image
          src="/mic.png"
          alt="Microphone Icon"
          width={50}
          height={50}
        />
      </MicrophoneIcon>
      <SignUp />
    </Container>
  );
}
