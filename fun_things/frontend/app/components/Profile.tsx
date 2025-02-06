"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";
import axios from "axios";
import { FavoriteBorder, AddBox } from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import MiniActivityCard from "./MiniActivityCard";
import { useRouter } from "next/navigation"; // ✅ Import useRouter

interface Activity {
  id: number;
  title: string;
  image_url?: string;
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function Profile() {
  const [favorites, setFavorites] = useState<Activity[]>([]);
  const [createdActivities, setCreatedActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"favorites" | "created">("favorites");

  const router = useRouter(); // ✅ Initialize useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("User token not available");

        const favResponse = await axios.get("http://127.0.0.1:8000/core/get-user-favorites/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (favResponse.data && Array.isArray(favResponse.data.favorites)) {
          setFavorites(favResponse.data.favorites);
        } else {
          console.error("Expected 'favorites' array but received:", favResponse.data);
          setFavorites([]);
        }

        const createdResponse = await axios.get("http://127.0.0.1:8000/core/get-user-created/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (createdResponse.data && Array.isArray(createdResponse.data.created_activities)) {
          setCreatedActivities(createdResponse.data.created_activities);
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

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md text-center">
      <div className="flex justify-center border-b pb-2">
        <button
          className={`flex items-center gap-2 px-4 py-2 text-lg font-medium transition ${
            activeTab === "favorites" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("favorites")}
        >
          <FavoriteBorder fontSize="large" />
        </button>
        <button
          className={`flex items-center gap-2 px-4 py-2 text-lg font-medium transition ${
            activeTab === "created" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("created")}
        >
          <AddBox fontSize="large" />
        </button>
      </div>

      {!loading && (
        <div className="mt-6">
          {error ? (
            <p className="text-red-500 mt-4">{error}</p>
          ) : activeTab === "favorites" && favorites.length === 0 ? (
            <p className="text-gray-500 mt-4">You haven't favorited any activities yet.</p>
          ) : activeTab === "created" && createdActivities.length === 0 ? (
            <p className="text-gray-500 mt-4">You haven't created any activities yet.</p>
          ) : (
            <div className="mt-6 flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {(activeTab === "favorites" ? favorites : createdActivities).map((activity) => (
                  <div
                    key={activity.id}
                    onClick={() => {
                      router.push(`/activity/${activity.id}`);
                      setView("home")
                    }}
                    className="cursor-pointer"
                  >
                    <MiniActivityCard activity={activity} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col justify-center items-center mt-6">
        <button
          onClick={async () => {
            await signOut(auth);
            window.location.reload();
          }}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition mt-4 flex items-center gap-2"
        >
          <LogoutIcon />
          Logout
        </button>
      </div>
    </div>
  );
}
