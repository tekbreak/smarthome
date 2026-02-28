import styled from "@emotion/styled";

export const OverlayStyle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  background: black;
  opacity: 0.8;
  z-index: 1;
`;

export const PhoneStyle = styled.div`
  position: absolute;
  left: 0;
  bottom: 0;
  padding: 0.5em;
  display: flex;
  z-index: 2;
`;

export const CallButtonStyle = styled.div`
  width: 8em;
  height: 8em;
  border-radius: 25%;
  border: 3px solid white;
  color: white;
  background-color: green;
  display: flex;
  justify-content: center;
  align-items: center;
  align-self: flex-end;

  svg {
    font-size: 5.5em;

    animation-name: tilt-shaking;
    animation-duration: 1s;
    animation-iteration-count: infinite;
  }
`;

export const PhonePeopleStyle = styled.div`
  //display: flex;
  //width: 100%;
  //justify-content: space-around;

  position: absolute;
  left: 0;
  bottom: 5em;
  width: 100vw;
  height: 100vh;
  z-index: 2;
  display: flex;
  align-items: flex-end;
  justify-content: center;
`;

export const PhonePersonStyle = styled.div`
  a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.5em;
    color: white;
    text-decoration: none;

    &:hover,
    &:active,
    &:visited {
      color: white;
      text-decoration: none;
    }
  }

  img {
    width: 8em;
    height: 8em;
    border-radius: 50%;
    max-width: 100%;
    background-color: white;
    margin: 0 3em;
  }

  span {
    margin-top: 0.5em;
    font-size: 2em;
  }
`;

export const SOSStyle = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100vw;
  height: 50vh;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;

  div {
    width: 30vh;
    height: 30vh;
    background: red;
    border-radius: 10%;
    border: 1em solid black;
    display: flex;
    justify-content: center;
    align-items: center;

    a {
      //display: flex;
      //flex-direction: column;
      //align-items: center;
      //justify-content: center;
      //font-size: 1.5em;
      color: white;
      text-decoration: none;

      &:hover,
      &:active,
      &:visited {
        color: white;
        text-decoration: none;
      }
    }

    svg {
      font-size: 20em;
    }
  }
`;
