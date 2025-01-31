import { useState } from "react";
import { Favorite, FavoriteBorder, ThumbUp, ThumbDown } from "@mui/icons-material";
import { MdAccessible } from "react-icons/md"; // Accessibility icon
import { FaPaw } from "react-icons/fa"; // White paw icon

interface Thing {
  image_url?: string;
  title: string;
  url: string;
  description: string;
  pets_allowed?: boolean;
  accessibility?: boolean;
}

interface ThingCardProps {
  thing: Thing;
  onNextActivity: () => void;
  isLoggedIn: boolean;  
  onRequireLogin: () => void;
  showRegister: boolean; // New prop to disable description pop-up
}

export default function ThingCard({ thing, onNextActivity, isLoggedIn, onRequireLogin, showRegister }: ThingCardProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!isLoggedIn) {
      onRequireLogin();
      return;
    }
    setSaved(!saved);
  };

  return (
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative w-full h-[50vh] md:h-[60vh]">
        {thing.image_url ? (
          <img
            src={thing.image_url}
            alt={thing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}

        {/* Floating Icons - Top Right */}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-5 z-20">
          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={handleSave}>
            {saved ? <Favorite fontSize="large" className="drop-shadow-lg shadow-black" /> : <FavoriteBorder fontSize="large" className="drop-shadow-lg shadow-black" />}
          </button>

          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={() => (!isLoggedIn ? onRequireLogin() : onNextActivity())}>
            <ThumbUp fontSize="large" className="drop-shadow-lg shadow-black" />
          </button>

          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={() => (!isLoggedIn ? onRequireLogin() : onNextActivity())}>
            <ThumbDown fontSize="large" className="drop-shadow-lg shadow-black" />
          </button>
        </div>

        {/* Accessibility & Pets Icons */}
        {(thing.pets_allowed || thing.accessibility) && (
          <div className="absolute top-4 left-4 flex gap-3 text-white drop-shadow-lg shadow-black z-20">
            {thing.pets_allowed && <FaPaw className="text-4xl drop-shadow-lg shadow-black" />}
            {thing.accessibility && <MdAccessible className="text-4xl drop-shadow-lg shadow-black" />}
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
          <h2 className="text-white text-2xl font-bold drop-shadow-lg shadow-black">
            <a href={thing.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {thing.title}
            </a>
          </h2>
        </div>

        {/* Description Overlay (Disabled When Register Modal is Open) */}
        {!showRegister && (
          <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6 z-10">
            <div className="max-h-[80%] overflow-y-auto text-left pr-4">
              <p className="text-lg drop-shadow-lg shadow-black">{thing.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
