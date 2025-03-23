import ImageCropper from "../ImageCropper.jsx";
import LivingRoomThumbnail from "../../assets/living_room/thumbnail.jpg";
export default function ShadeRoom() {
  return (
    <div>
      <h1>Shade Room</h1>
      <p>Welcome to the Shade Room!</p>
      <ImageCropper imageSrc={LivingRoomThumbnail} />
      {/* Add your content here */}
    </div>
  );
}
