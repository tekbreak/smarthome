import { useEffect } from "react";

export const Camera = () => {
  useEffect(() => {
    if (
      "mediaDevices" in navigator &&
      "getUserMedia" in navigator.mediaDevices
    ) {
      console.log("Let's get this party started");
      navigator.mediaDevices.getUserMedia({ video: true });
    }
  }, []);

  return <div></div>;
};
