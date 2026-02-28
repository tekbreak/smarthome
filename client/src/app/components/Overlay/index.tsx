import styled from "@emotion/styled";

export const Overlay: React.FC<{ zIndex?: number; onClick: () => void }> = ({
  zIndex,
  onClick,
}) => {
  const Component = styled.div`
    position: absolute;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    background: black;
    opacity: 0.95;
    z-index: ${zIndex ?? 1};
    overflow: hidden;
  `;

  return <Component onClick={onClick} />;
};
