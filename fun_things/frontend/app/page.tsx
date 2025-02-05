"use client"; // Ensure client-side rendering

import { useState, useEffect } from "react";
import axios from "axios";
import ThingCard from "./components/ThingCard";
import Profile from "./components/Profile";
import AddContent from "./components/AddContent";
import FirebaseAuth from "./components/FirebaseAuth";
import { Home, AccountCircle, AddBox } from "@mui/icons-material";
import { auth } from "./utils/firebase";
import { useUserLocation } from "./hooks/useUserLocation"; // ✅ Location Hook

interface Activity {
  id: number;
  title: string;
  description: string;
  park_name?: string;
  url: string;
  image_url?: string;
  hashtags?: string[];
  pets_allowed?: boolean;
  accessibility?: boolean;
}

export default function HomePage() {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Get User Location Dynamically
  const { location, getLocation, error, loading: locationLoading } = useUserLocation();
  const longitude = location?.longitude;
  const latitude = location?.latitude;

  // ✅ Check Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  // ✅ Get user location when the site loads
  useEffect(() => {
    getLocation(); // Request location on mount
  }, []);

  // ✅ Fetch activity only when location is available
  useEffect(() => {
    if (latitude && longitude) {
      fetchActivity();
    }
  }, [latitude, longitude]); // 🔹 Only runs when location updates

  // ✅ Fetch an activity using the current location
  const fetchActivity = async () => {
    setLoading(true);

    if (!latitude || !longitude) {
      console.log("⏳ Waiting for location before fetching activity...");
      return;
    }

    try {
      console.log("🌍 Fetching activity at:", { latitude, longitude });
      const res = await axios.get<Activity>(
        `http://127.0.0.1:8000/core/get-activity/?latitude=${latitude}&longitude=${longitude}`
      );
      setActivity(res.data);
    } catch (error) {
      console.error("❌ Error fetching activity:", error);
    }
    setLoading(false);
  };

  // Handles clicks that require login
  const handleProtectedClick = (viewName: string) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
    } else {
      setView(viewName);
    }
  };

  // ✅ Called when user logs in successfully via FirebaseAuth
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 px-4 md:px-8 lg:px-12 py-6 relative">
      <div className={`w-full max-w-5xl transition-opacity ${showAuthModal ? "pointer-events-none opacity-50" : "opacity-100"}`}>
        
        {/* HEADER */}
        <header className="w-full text-center my-6">
          <h1 className="text-4xl font-bold text-gray-900">Fun Things Near Me</h1>
          <p className="text-gray-600 mt-2 text-lg">
            {location
              ? `Discover cool activities near you!`
              : "Discover cool activities around the world!"}
          </p>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {locationLoading && <p className="text-gray-500 text-sm">Getting your location...</p>}

          {/* NAVIGATION BUTTONS */}
          <div className="flex justify-center gap-6 mt-4">
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
        <main className="w-full flex-grow flex flex-col items-center">
          {view === "home" && (
            <div className="w-full max-w-2xl">
              {loading || locationLoading ? (
                <p className="text-gray-500 text-lg text-center">Loading... {locationLoading}</p>
              ) : (
                activity && (
                  <ThingCard
                    thing={activity}
                    onNextActivity={fetchActivity}
                    isLoggedIn={isLoggedIn}
                    onRequireLogin={() => setShowAuthModal(true)}
                    showRegister={showAuthModal}
                  />
                )
              )}
            </div>
          )}

          {view === "profile" && <Profile onLogin={() => setShowAuthModal(true)} />}
          {view === "add" && <AddContent />}
        </main>

        {/* FOOTER */}
        <footer className="mt-auto py-6 text-gray-500 text-sm text-center">
          Made with ❤️ by FunThingsNearMe
        </footer>
      </div>

      {/* ✅ FirebaseAuth Modal for Login/Signup */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <FirebaseAuth onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
        </div>
      )}
    </div>
  );
}
