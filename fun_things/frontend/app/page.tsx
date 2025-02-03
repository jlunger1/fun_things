"use client"; // Ensure client-side rendering

import { useState, useEffect } from "react";
import axios from "axios";
import ThingCard from "./components/ThingCard";
import Profile from "./components/Profile";
import AddContent from "./components/AddContent";
import FirebaseAuth from "./components/FirebaseAuth"; // ✅ Import FirebaseUI modal
import { Home, AccountCircle, AddBox } from "@mui/icons-material";
import { auth } from "./utils/firebase"; // ✅ Import Firebase Auth

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Check Firebase auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe(); // Cleanup listener
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
      setShowAuthModal(true);
    } else {
      setView(viewName);
    }
  };

  // ✅ Called when user logs in successfully via FirebaseAuth
  const handleAuthSuccess = () => {
    setIsLoggedIn(true);
    setShowAuthModal(false); // Close modal
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 p-6 relative">
      {/* ✅ Wrap all content in a div and apply `pointer-events-none` when modal is open */}
      <div className={`w-full transition-opacity ${showAuthModal ? "pointer-events-none opacity-50" : "opacity-100"}`}>
        {/* HEADER */}
        <header className="w-full max-w-4xl text-center my-6">
          <h1 className="text-4xl font-bold text-gray-900">Fun Things Near Me</h1>
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
                  onRequireLogin={() => setShowAuthModal(true)}
                  showRegister={showAuthModal}
                />
              )
            )}
          </main>
        )}

        {view === "profile" && <Profile onLogin={() => setShowAuthModal(true)} />}
        {view === "add" && <AddContent />}

        {/* FOOTER */}
        <footer className="mt-auto py-4 text-gray-500 text-sm">
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
