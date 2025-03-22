import SelectImage from "../components/content/SelectImage.jsx";
import SelectShades from "../components/content/SelectShades.jsx";
import ShadeRoom from "../components/content/ShadeRoom.jsx";
import SaveShare from "../components/content/SaveShare.jsx";

export const steps = [
  {
    name: "Select Image",
    description: "Choose an image from your device.",
    component: SelectImage,
  },
  {
    name: "Select Shades",
    description: "Choose colors, textures to apply.",
    component: SelectShades,
  },
  {
    name: "Shade Room",
    description: "Visualize your design in a room.",
    component: ShadeRoom,
  },
  {
    name: "Save & Share",
    description: "Save your design or share it with others.",
    component: SaveShare,
  },
];
