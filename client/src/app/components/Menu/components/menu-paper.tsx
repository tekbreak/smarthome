import styled from "@emotion/styled";
import { Paper, PaperProps } from "@mui/material";
import { ReactNode } from "react";

export const MenuPaper: React.FC<
  {
    bgColor?: string;
    children: ReactNode;
  } & PaperProps
> = ({ children, ...otherProps }) => {
  return (
    <PaperStyle elevation={0} {...otherProps}>
      {children}
    </PaperStyle>
  );
};

const PaperStyle = styled(Paper)<{ bgColor?: string }>`
  position: relative;
  width: 100%;
  min-height: 7em;
  background-color: ${(props) => props.bgColor ?? "#25252a"};
  padding: 2em 2em;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 1em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.2s, border-color 0.2s, transform 0.15s, box-shadow 0.2s;

  &:hover {
    background-color: #2e2e34;
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .title {
    font-size: 2rem;
  }
`;
