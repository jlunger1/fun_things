"use client";

import { useState, useEffect } from "react";
import { Favorite, FavoriteBorder, ThumbUp, ThumbDown } from "@mui/icons-material";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";
import { auth } from "../utils/firebase";
import axios from "axios";

interface Thing {
  id: number;
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
  showRegister: boolean;
}

export default function ThingCard({ thing, onNextActivity, isLoggedIn, onRequireLogin, showRegister }: ThingCardProps) {
  const [saved, setSaved] = useState(false);

  // ✅ Fetch user's favorite activities on mount
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;

      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("User token not available");

        const res = await axios.get("http://127.0.0.1:8000/core/get-user-favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favoriteIds: number[] = res.data.favorites;
        setSaved(favoriteIds.includes(thing.id)); // ✅ Check if current thing is in favorites
      } catch (error) {
        console.error("Error fetching user favorites:", error);
      }
    };

    fetchFavorites();
  }, [isLoggedIn, thing.id]); // ✅ Refetch when login status or thing.id changes

  const handleAction = async (action: "favorite" | "upvote" | "downvote") => {
    if (!isLoggedIn) {
      onRequireLogin(); // ✅ Open login modal if user is not logged in
      return;
    }

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("User token not available");

      const res = await axios.post(
        "http://127.0.0.1:8000/core/update-preference/",
        { activity_id: thing.id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Preference updated:", res.data);
      if (action === "favorite") setSaved(!saved);
      if (action === "upvote" || action === "downvote") onNextActivity();
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  return (
    <div className={`relative w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden ${showRegister ? "pointer-events-none opacity-50" : ""}`}>
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
        <div className="absolute top-4 right-4 flex flex-col items-center gap-5 z-20">
          {/* Favorite (Heart) Button */}
          <button
            className="hover:scale-110 transition text-white drop-shadow-lg shadow-black"
            onClick={() => handleAction("favorite")}
          >
            {saved ? <Favorite fontSize="large" className="drop-shadow-lg shadow-black" /> : <FavoriteBorder fontSize="large" className="drop-shadow-lg shadow-black" />}
          </button>

          {/* Upvote Button */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={() => handleAction("upvote")}>
            <ThumbUp fontSize="large" className="drop-shadow-lg shadow-black" />
          </button>

          {/* Downvote Button */}
          <button className="hover:scale-110 transition text-white drop-shadow-lg shadow-black" onClick={() => handleAction("downvote")}>
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

        {/* ✅ Description Overlay (Appears on Hover) */}
        <div 
          className={`absolute inset-y-0 left-0 w-2/3 bg-black/70 text-white transition-opacity duration-300 flex items-center justify-center p-6 z-10 ${
            showRegister ? "opacity-0 pointer-events-none" : "opacity-0 hover:opacity-100"
          }`}
        >
          <div className="max-h-[80%] overflow-y-auto text-left pr-4">
            <p className="text-lg drop-shadow-lg shadow-black">{thing.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
