import styled from "@emotion/styled";

export const BoxContainer = styled.div`
  flex: 1;
  padding: 5em 3em;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5em;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  align-content: start;

  .switch {
    position: relative;
  }
`;

export const MenuButtonStyle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;

  svg {
    font-size: 6em;
  }
`;

export const FullscreenButton = styled.div`
  position: absolute;
  right: 1em;
  top: 0.5em;
  z-index: 1;
  cursor: pointer;
  padding: 0.25em;
  border-radius: 8px;
  color: #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 2.5em;
  }
`;

export const MenuStyle = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  background: linear-gradient(180deg, #1a1a1e 0%, #121214 100%);
  color: #f0f0f0;
  margin: 6vh 5vw 6vh 5vw;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.6);
`;

export const BackMenuButton = styled.div`
  position: absolute;
  top: 1em;
  left: 1em;
  cursor: pointer;
  padding: 0.25em;
  border-radius: 8px;
  color: #f0f0f0;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  svg {
    font-size: 2.5em;
  }
`;
