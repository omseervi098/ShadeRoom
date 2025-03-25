import ImageCropper from "../ImageCropper.jsx";
import LivingRoomThumbnail from "../../assets/living_room/thumbnail.jpg";
import BedroomThumbnail from "../../assets/bedroom/thumbnail.jpg";
import ImageColorsExtractor from "../ImageColorsExtractor.jsx";
import SelectColorsFromPalette from "../selectFromPalette.jsx";
import RecommendedColors from "../RecommendedColors.jsx";
export default function ShadeRoom() {
  // console.log(LivingRoomThumbnail);
  return (
    <div>
      <h1>Shade Room</h1>
      <p>Welcome to the Shade Room!</p>
      <RecommendedColors />
      {/* Add your content here */}
    </div>
  );
}
