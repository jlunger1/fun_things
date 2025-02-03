"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import axios from "axios";
import { MdAccessible } from "react-icons/md";
import { FaPaw } from "react-icons/fa";
import LogoutIcon from '@mui/icons-material/Logout';

interface FavoriteActivity {
  id: number;
  title: string;
  url?: string;
  image_url?: string;
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function Profile() {
  const [favorites, setFavorites] = useState<FavoriteActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("User token not available");

        // ✅ Step 1: Get favorite activity IDs
        const res = await axios.get("http://127.0.0.1:8000/core/get-user-favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favoriteIds: number[] = res.data.favorites;
        if (favoriteIds.length === 0) {
          setFavorites([]);
          return;
        }

        // ✅ Step 2: Fetch details for each favorite activity
        const activityRequests = favoriteIds.map((id) =>
          axios.get(`http://127.0.0.1:8000/core/get-activity-details/${id}/`)
        );

        const activityResponses = await Promise.all(activityRequests);
        const activityDetails = activityResponses.map((res) => res.data);

        setFavorites(activityDetails);
      } catch (err) {
        setError("Failed to fetch favorites.");
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.reload(); // ✅ Reload page to reflect logout state
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
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
              <div
                key={activity.id}
                className="relative w-full max-w-3xl rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Image Container - Uses the Same Aspect Ratio as ThingCard */}
                <div className="relative w-full aspect-[9/9] h-auto">
                  {activity.image_url ? (
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  )}

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
            ))}
          </div>
        </div>
      )}

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
