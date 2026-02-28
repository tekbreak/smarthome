import CONFIG from "../../../config";
import CallIcon from "@mui/icons-material/Call";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import {
  CallButtonStyle,
  OverlayStyle,
  PhonePeopleStyle,
  PhonePersonStyle,
  PhoneStyle,
  SOSStyle,
} from "./style";

import Slide from "@mui/material/Slide";
import { useState } from "react";
import { Overlay } from "../Overlay";
import { androidBridge, IS_ANDROID } from "../../helpers/android";
import { Android } from "@mui/icons-material";

export const Phone: React.FC = () => {
  const [showPeople, setShowPeople] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const _onClick = () => {
    if (!showPeople) {
      const time = setTimeout(() => setShowPeople(false), 5 * 60 * 1000); // 5 minutes
      setTimeoutId(time);
    } else {
      clearTimeout(timeoutId);
    }
    setShowPeople(!showPeople);
  };

  return (
    <>
      {showPeople && <Overlay onClick={() => setShowPeople(false)} />}
      <SOS show={showPeople} />
      <People show={showPeople} />
      <PhoneStyle>
        <CallButtonStyle onClick={_onClick}>
          <CallIcon />
        </CallButtonStyle>
      </PhoneStyle>
    </>
  );
};

const People: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <Slide in={show} direction={"up"}>
      <PhonePeopleStyle>
        {CONFIG.phone.people.map(({ name, id, phone }) => {
          const href = `tel:${phone}`;
          const linkProps = IS_ANDROID
            ? { onClick: () => androidBridge.call(href) }
            : {
                href,
              };
          return (
            <PhonePersonStyle key={name}>
              <a {...linkProps}>
                <img alt={name} src={`/images/${id}.png`} />
                <span>{name}</span>
              </a>
            </PhonePersonStyle>
          );
        })}
      </PhonePeopleStyle>
    </Slide>
  );
};

const SOS: React.FC<{ show: boolean }> = ({ show }) => {
  return (
    <Slide in={show} direction={"down"}>
      <SOSStyle>
        <div>
          {IS_ANDROID ? (
            <a
              onClick={() => androidBridge.call("tel:112")}
              onKeyDown={(e) => e.key === "Enter" && androidBridge.call("tel:112")}
              role="button"
              tabIndex={0}
            >
              <LocalHospitalIcon />
            </a>
          ) : (
            <a href="tel:112">
              <LocalHospitalIcon />
            </a>
          )}
        </div>
      </SOSStyle>
    </Slide>
  );
};
