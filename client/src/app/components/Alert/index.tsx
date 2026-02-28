import { FC, useEffect } from "react";
import styled from "@emotion/styled";
import { Alert } from "../../types";
import { uiNotification } from "../../helpers";

export const AlertMessage: FC<{ alert?: Alert; clearAlert: () => void }> = ({
  alert,
  clearAlert,
}) => {
  useEffect(() => {
    if (alert) {
      uiNotification(alert.level, `${alert.title}.\n ${alert?.message ?? ""}`);
    }
  }, [alert]);

  if (!alert) {
    return null;
  }

  return (
    <AlertStyle
      backgroundColor={alert.backgroundColor}
      hasIcon={!!alert.icon}
      onClick={() => clearAlert()}
    >
      <div className={`Alert Alert--${alert.level}`}>
        {alert.icon && <div>Icon</div>}
        <div>
          <h1>{alert.title}</h1>
          <p>{alert.message}</p>
        </div>
      </div>
    </AlertStyle>
  );
};

const AlertStyle = styled.div<{
  backgroundColor: string;
  hasIcon: boolean;
}>`
  position: absolute;
  height: 100vh;
  width: 100vw;
  top: 0;
  left: 0;
  z-index: 9999;

  background-color: ${(props) => props.backgroundColor};

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .Alert {
    display: flex;
    justify-content: ${(props) => (props.hasIcon ? "flex-start" : "center")};

    h1 {
      font-size: 16em;
      line-height: 0.8em;
    }
    p {
      font-size: 10em;
      line-height: 1em;
    }

    &--low {
    }
  }
`;

export default AlertMessage;
