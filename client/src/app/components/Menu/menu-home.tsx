import { Typography } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import MapIcon from "@mui/icons-material/Map";
import SensorsIcon from "@mui/icons-material/Sensors";
import { MenuPaper } from "./components/menu-paper";

export const MenuHome: React.FC<{ setMenu: (s: string) => void }> = ({
  setMenu,
}) => {
  const items = [
    {
      id: "control",
      name: "Control",
      icon: DashboardIcon,
      description: "Controlar dispositivos",
    },
    {
      id: "sensores",
      name: "Sensores",
      icon: SensorsIcon,
      description: "Puertas y temperatura",
    },
    {
      id: "triggers",
      name: "Lanzadores",
      icon: RocketLaunchIcon,
      description: "Lanzar acciones en dispositivo",
    },
    {
      id: "homemap",
      name: "Mapa de Casa",
      icon: MapIcon,
      description: "Ver plano de la casa",
    },
  ];
  return (
    <>
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <MenuPaper key={item.id} onClick={() => setMenu(item.id)}>
            <Icon
              sx={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "rgba(255, 255, 255, 0.9)",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.25em", minWidth: 0 }}>
              <Typography
                variant="h2"
                component="div"
                sx={{
                  fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
                  fontWeight: 600,
                  color: "#f0f0f0",
                }}
              >
                {item.name}
              </Typography>
              <Typography
                sx={{
                  fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
                  color: "rgba(255, 255, 255, 0.65)",
                  lineHeight: 1.3,
                }}
              >
                {item.description}
              </Typography>
            </div>
          </MenuPaper>
        );
      })}
    </>
  );
};
