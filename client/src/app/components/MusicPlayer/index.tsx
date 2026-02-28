import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { MusicPlayerIcon, Player } from "./style";
import { useEffect, useState } from "react";
import { Box, Drawer } from "@mui/material";
import { androidBridge } from "../../helpers/android";
export const MusicPlayer = () => {
  const [show, setShow] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (show !== undefined) {
      androidBridge.bluetooth(show);
    }
  }, [show]);

  return (
    <>
      <MusicPlayerIcon onClick={() => setShow(!show)}>
        <LibraryMusicIcon />
      </MusicPlayerIcon>

      <Drawer open={show} anchor={"bottom"} onClose={() => setShow(false)}>
        <Box
          component="iframe"
          sx={{ border: 0, height: "95vh", width: "100%" }}
          src="//mp3player.tekbreak.com"
        />
      </Drawer>
    </>
  );
  // return ;
};
