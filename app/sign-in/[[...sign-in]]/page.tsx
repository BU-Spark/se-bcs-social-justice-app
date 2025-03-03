"use client";

import { SignIn } from "@clerk/nextjs";
import Image from "next/image";
import styled, { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    overflow-x: hidden;
    margin: 0;
    padding: 0;
  }
`;

const Background = styled.div`
  position: fixed;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: -1;
  opacity: 0.6;
`;

const MainContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  position: relative;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1;
  position: relative;
`;

const MicrophoneIcon = styled.div`
  position: absolute;
  top: -130px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 120px;
  height: 120px;
  z-index: 1;
`;

const SignInWrapper = styled.div`
  transform: scale(1);
  transform-origin: center;
  width: 100%;
`;

export default function Page() {
  return (
    <>
      <GlobalStyle />
      <Background>
        <Image
          src="/signin.png"
          alt="Background Image"
          layout="fill"
          objectFit="cover"
          objectPosition="center"
        />
      </Background>
      <MainContainer>
        <ContentContainer>
          <MicrophoneIcon>
            <Image
              src="/mic.png"
              alt="Microphone Icon"
              width={120}
              height={120}
            />
          </MicrophoneIcon>
          <SignInWrapper>
            <SignIn />
          </SignInWrapper>
        </ContentContainer>
      </MainContainer>
    </>
  );
}
