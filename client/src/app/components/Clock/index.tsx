import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/es";
import styled from "@emotion/styled";
import {
  DATE_FORMAT,
  DAY_FORMAT,
  DAY_NAME_FORMAT,
  getFormattedDateTime,
  TIME_FORMAT,
} from "../../helpers/clock";
import { FC } from "react";

export const Clock: FC<{ currentTime: Dayjs; onClick: () => void }> = ({
  currentTime: current,
  onClick,
}) => {
  if (!current) {
    return null;
  }

  return (
    <StyledClock onClick={onClick}>
      <TimeStyle>
        <span>{getFormattedDateTime("HH", current)}</span>
        <span>:</span>
        <span>{getFormattedDateTime("mm", current)}</span>
      </TimeStyle>
      <DateStyle>
        <span>{getFormattedDateTime(DAY_NAME_FORMAT, current)}</span>
        <span>{getFormattedDateTime(DAY_FORMAT, current)}</span>
        <span>{getFormattedDateTime(DATE_FORMAT, current)}</span>
      </DateStyle>
    </StyledClock>
  );
};

const StyledClock = styled.div`
  position: absolute;
  top: 45%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const TimeStyle = styled.div`
  font-size: 25em;
  font-variant-numeric: tabular-nums;
  line-height: 1em;
`;

const DateStyle = styled.div`
  font-size: 5em;
  display: flex;
  justify-content: space-between;
  display: none;
`;
//
// const StyledDate = styled.div`
//   font-size: 8em;
//   position: absolute;
//   bottom: 0;
//   left: 50%;
//   transform: translate(-50%, 0);
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   column-gap: 0.2em;
//
//   & > * {
//     line-height: 1em;
//   }
//
//   .container {
//     display: flex;
//     flex-direction: column;
//     height: 100%;
//     justify-content: space-between;
//     padding: 0.1em 0;
//   }
//
//   .day {
//     font-size: 1.5em;
//     line-height: 1em;
//   }
//
//   .day-name {
//     //text-transform: capitalize;
//     font-size: 0.6em;
//     line-height: 1em;
//     font-weight: 300;
//     margin-bottom: 0.2em;
//   }
//
//   .month-year {
//     text-transform: capitalize;
//     font-size: 0.4em;
//     line-height: 1.4em;
//     font-weight: 300;
//   }
// `;

/*
<StyledDate>
        <div className={"day"}>{getFormattedDateTime(DAY_FORMAT, current)}</div>
        <div className={"container"}>
          <div className={"day-name"}>
            {getFormattedDateTime(DAY_NAME_FORMAT, current)}
          </div>
          <div className={"month-year"}>
            {getFormattedDateTime(DATE_FORMAT, current)}
          </div>
        </div>
      </StyledDate>
 */
