import styled from "@emotion/styled";

export const MusicPlayerIcon = styled.div`
  position: absolute;
  z-index: 1300; // over drawer
  top: 1em;
  right: 1em;
`;

export const Player = styled.div`
  position: absolute;
  right: 0;
  top: 0;
  width: 50vw;
  height: 100vh;

  iframe {
    border: 0;
    width: 100%;
    height: 100%;
  }
`;
