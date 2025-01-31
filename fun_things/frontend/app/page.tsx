"use client"; // Ensure client-side rendering

import { useState, useEffect } from "react";
import axios from "axios";
import ThingCard from "./components/ThingCard";
import Profile from "./components/Profile";
import AddContent from "./components/AddContent";
import Register from "./components/Register";
import { Home, AccountCircle, AddBox } from "@mui/icons-material";

interface Activity {
  id: number;
  title: string;
  description: string;
  park_name?: string;
  url?: string;
  image_url?: string;
  hashtags?: string[];
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function HomePage() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(
    typeof window !== "undefined" && !!localStorage.getItem("access_token")
  );

  // ✅ Only check localStorage on the client
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(!!localStorage.getItem("access_token"));
    };
  
    checkAuth(); // Run immediately
  
    // Listen for storage changes (e.g., another tab logs out)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // Fetch a random activity
  const fetchRandomActivity = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Activity>("http://127.0.0.1:8000/core/random-activity/");
      setActivity(res.data);
    } catch (error) {
      console.error("Error fetching activity:", error);
    }
    setLoading(false);
  };

  // Load an initial activity when the component mounts
  useEffect(() => {
    fetchRandomActivity();
  }, []);

  // Handles clicks that require login
  const handleProtectedClick = (viewName: string) => {
    if (!isLoggedIn) {
      setShowRegister(true);
    } else {
      setView(viewName);
    }
  };

  // ✅ Called when a user successfully logs in or registers
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowRegister(false); // Close modal
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6">
      {/* HEADER */}
      <header className="w-full max-w-4xl text-center my-6">
        <h1 className="text-4xl font-bold text-gray-900">Fun Things To Do Near Me</h1>
        <p className="text-gray-600 mt-2">Discover cool activities near you!</p>

        {/* NAVIGATION BUTTONS */}
        <div className="flex justify-center gap-8 mt-4">
          <button onClick={() => setView("home")} className="text-gray-700 hover:text-blue-600 transition">
            <Home fontSize="large" />
          </button>
          <button onClick={() => handleProtectedClick("profile")} className="text-gray-700 hover:text-blue-600 transition">
            <AccountCircle fontSize="large" />
          </button>
          <button onClick={() => handleProtectedClick("add")} className="text-gray-700 hover:text-blue-600 transition">
            <AddBox fontSize="large" />
          </button>
        </div>
      </header>

      {/* VIEW SWITCHING */}
      {view === "home" && (
        <main className="w-full max-w-2xl flex flex-col items-center">
          {loading ? (
            <p className="text-gray-500 text-lg">Loading...</p>
          ) : (
            activity && (
              <ThingCard
                thing={activity}
                onNextActivity={fetchRandomActivity}
                isLoggedIn={isLoggedIn}
                onRequireLogin={() => setShowRegister(true)}
                showRegister={showRegister}
              />
            )
          )}
        </main>
      )}

      {view === "profile" && <Profile onLogin={() => setShowRegister(true)} />} {/* Profile Page */}
      {view === "add" && <AddContent />} {/* Add Content Page */}

      {/* Register/Login Modal */}
      {showRegister && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-2xl">
            <Register onClose={() => setShowRegister(false)} onAuthSuccess={handleAuthSuccess} />
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-auto py-4 text-gray-500 text-sm">
        Made with ❤️ by FunThingsToDoNearMe
      </footer>
    </div>
  );
}
