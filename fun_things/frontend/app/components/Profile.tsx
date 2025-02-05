"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import axios from "axios";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";
import { Favorite, ThumbUp, ThumbDown } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";

interface Activity {
  id: number;
  title: string;
  url?: string;
  image_url?: string;
  pets_allowed?: boolean;
  accessibility?: boolean;
  favorites_count: number;
  thumbs_up_count: number;
  thumbs_down_count: number;
}

export default function Profile() {
  const [favorites, setFavorites] = useState<Activity[]>([]);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("User token not available");

        // ✅ Fetch User Favorites
        const favResponse = await axios.get("http://127.0.0.1:8000/core/get-user-favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (favResponse.data && Array.isArray(favResponse.data.favorites)) {
          setFavorites(favResponse.data.favorites); // ✅ Extract the correct array
        } else {
          console.error("Expected 'favorites' array but received:", favResponse.data);
          setFavorites([]); // Fallback to empty array
        }

        // ✅ Fetch User-Created Activities
        const createdResponse = await axios.get("http://127.0.0.1:8000/core/get-user-created/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (createdResponse.data && Array.isArray(createdResponse.data.created_activities)) {
          setCreatedActivities(createdResponse.data.created_activities); // ✅ Extract array properly
        } else {
          console.error("Expected 'created_activities' array but received:", createdResponse.data);
          setCreatedActivities([]);
        }

      } catch (err) {
        setError("Failed to fetch activities.");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
      {/* Section: Favorite Activities */}
      <div className="flex flex-col justify-center items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Your Favorite Activities</h2>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading favorites...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : favorites.length === 0 ? (
        <p className="text-gray-500 mt-4">You haven't favorited any activities yet.</p>
      ) : (
        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {favorites.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Section: Created Activities */}
      <div className="flex flex-col justify-center items-center mt-12">
        <h2 className="text-3xl font-bold text-gray-800">Your Created Activities</h2>
      </div>

      {loading ? (
        <p className="text-gray-500 mt-4">Loading created activities...</p>
      ) : createdActivities.length === 0 ? (
        <p className="text-gray-500 mt-4">You haven't created any activities yet.</p>
      ) : (
        <div className="mt-6 flex justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {createdActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      )}

      {/* Logout Button */}
      <div className="flex flex-col justify-center items-center mt-6">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition mt-4 flex items-center gap-2"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
}

// ✅ Reusable ActivityCard Component
function ActivityCard({ activity }: { activity: Activity }) {
  return (
    <div className="relative w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden">
      {/* Image Container */}
      <div className="relative w-full aspect-[9/9] h-auto">
        {activity.image_url ? (
          <img src={activity.image_url} alt={activity.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
            No Image Available
          </div>
        )}

        {/* Floating Icons - Favorites, Thumbs Up, Thumbs Down */}
        <div className="absolute top-4 right-4 flex flex-col items-center gap-3 z-20 text-white drop-shadow-lg">
          <div className="flex items-center gap-1">
            <Favorite fontSize="large" />
            <span className="text-lg font-bold">{activity.favorites_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbUp fontSize="large" />
            <span className="text-lg font-bold">{activity.thumbs_up_count}</span>
          </div>
          <div className="flex items-center gap-1">
            <ThumbDown fontSize="large" />
            <span className="text-lg font-bold">{activity.thumbs_down_count}</span>
          </div>
        </div>

        {/* Accessibility & Pets Icons */}
        {(activity.pets_allowed || activity.accessibility) && (
          <div className="absolute top-4 left-4 flex gap-3 text-white drop-shadow-lg shadow-black z-20">
            {activity.pets_allowed && <FaPaw className="text-4xl drop-shadow-lg shadow-black" />}
            {activity.accessibility && <MdAccessible className="text-4xl drop-shadow-lg shadow-black" />}
          </div>
        )}

        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
          <h3 className="text-white text-2xl font-bold drop-shadow-lg">
            <a href={activity.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {activity.title}
            </a>
          </h3>
        </div>
      </div>
    </div>
  );
}
