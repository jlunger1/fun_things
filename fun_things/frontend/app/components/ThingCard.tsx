import { useState } from "react";
import { Favorite, FavoriteBorder, ThumbUp, ThumbDown } from "@mui/icons-material";
import { MdAccessible } from "react-icons/md"; // Accessibility icon
import { FaPaw } from "react-icons/fa"; // White paw icon

export default function ThingCard({ thing, onNextActivity }) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Image with Title Overlay & Icons */}
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
        <div className="absolute top-4 right-4 flex flex-col items-center gap-5">
          {/* Favorite (Heart) Button - MUI with Black Shadow */}
          <button
            className="hover:scale-110 transition text-white drop-shadow-lg shadow-black"
            onClick={() => setSaved(!saved)}
          >
            {saved ? <Favorite fontSize="large" className="drop-shadow-lg shadow-black" /> : <FavoriteBorder fontSize="large" className="drop-shadow-lg shadow-black" />}
          </button>

          {/* Upvote Button - MUI (Triggers Next Activity) */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={onNextActivity}>
            <ThumbUp fontSize="large" className="drop-shadow-lg shadow-black" />
          </button>

          {/* Downvote Button - MUI (Triggers Next Activity) */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={onNextActivity}>
            <ThumbDown fontSize="large" className="drop-shadow-lg shadow-black" />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4">
          <h2 className="text-white text-2xl font-bold drop-shadow-lg shadow-black">
            <a href={thing.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {thing.title}
            </a>
          </h2>
        </div>

        {/* Description Overlay (Appears on Hover, Stays Left) */}
        <div className="absolute inset-y-0 left-0 w-2/3 bg-black/70 text-white opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
          <div className="max-h-[60%] overflow-y-auto text-left pr-4">
            <p className="text-lg drop-shadow-lg shadow-black">{thing.description}</p>
          </div>
        </div>

        {/* Accessibility & Pets Icons (Bottom Right) */}
        {(thing.pets_allowed || thing.accessibility) && (
          <div className="absolute bottom-4 right-4 flex gap-3 text-white drop-shadow-lg shadow-black">
            {thing.pets_allowed && <FaPaw className="text-4xl drop-shadow-lg shadow-black" />}
            {thing.accessibility && <MdAccessible className="text-4xl drop-shadow-lg shadow-black" />}
          </div>
        )}
      </div>
    </div>
  );
}
