import styled from "@emotion/styled";
import { FC } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  DATE_FORMAT,
  DAY_FORMAT,
  DAY_NAME_FORMAT,
  getFormattedDateTime,
} from "../../helpers/clock";
import TodayWeather from "./today-weather";
import { Box } from "@mui/material";

export const Today: FC<{
  current: Dayjs;
}> = ({ current }) => {
  return (
    <TodayStyle>
      <TodayWeather />
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
    </TodayStyle>
  );
};
export default Today;

const TodayStyle = styled.div`
  font-size: 1.6em;
  height: 8em;
  width: 100%;
  position: absolute;
  bottom: 0;
  display: flex;
  align-items: flex-end;

  div {
    height: 100%;
  }

  & > div {
    width: 50%;
    max-width: 50%;
    padding: 0 2em;

    & + div {
      border-left: 1px solid #666;
    }
  }
`;

const StyledDate = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  column-gap: 1.5em;

  & > * {
    line-height: 1em;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    padding: 1.8em 0;
  }

  .day {
    font-size: 8em;
    line-height: 1em;
  }

  .day-name {
    //text-transform: capitalize;
    font-size: 4em;
    font-weight: 300;
    margin-bottom: 0.1em;
    line-height: 0;
  }

  .month-year {
    text-transform: capitalize;
    font-size: 2.5em;
    font-weight: 300;
    line-height: 2.8;
  }
`;
